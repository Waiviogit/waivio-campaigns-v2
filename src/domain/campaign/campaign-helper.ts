import { Inject, Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { ObjectId } from 'mongoose';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import {
  APP_PROVIDE,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  CURRENCY_RATES_PROVIDE,
  ENGINE_MARKETPOOLS,
  HIVE_ENGINE_PROVIDE,
  HIVE_PROVIDE,
  PAYOUT_TOKEN,
  REDIS_EXPIRE,
  REDIS_KEY,
  REDIS_PROVIDE,
  RESERVATION_STATUS,
  SUPPORTED_CURRENCY,
} from '../../common/constants';
import { RedisClientInterface } from '../../services/redis/clients/interface';
import {
  CampaignHelperInterface,
  IncrReviewCommentInterface,
  ValidateMinRewardParams,
  ValidateMinRewardResult,
} from './interface';
import {
  AggregateSameUserReservationType,
  GetCompletedUsersInSameCampaignsOutType,
  GetCompletedUsersInSameCampaignsType,
  SetExpireAssignType,
  SetExpireSuspendWarningType,
} from './types';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import axios from 'axios';
import { HiveEngineClientInterface } from '../../services/hive-engine-api/interface';
import { CurrencyRatesRepositoryInterface } from '../../persistance/currency-rates/interface';
import { configService } from '../../common/config';
import { HiveClientInterface } from '../../services/hive-api/interface';
import { rrulestr } from 'rrule';
import { CampaignDocumentType } from '../../persistance/campaign/types';
import { AppRepositoryInterface } from '../../persistance/app/interface';

@Injectable()
export class CampaignHelper implements CampaignHelperInterface {
  private readonly logger = new Logger(CampaignHelper.name);

  constructor(
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(HIVE_ENGINE_PROVIDE.CLIENT)
    private readonly hiveEngineClient: HiveEngineClientInterface,
    @Inject(CURRENCY_RATES_PROVIDE.REPOSITORY)
    private readonly currencyRatesRepository: CurrencyRatesRepositoryInterface,
    @Inject(HIVE_PROVIDE.CLIENT)
    private readonly hiveClient: HiveClientInterface,
    @Inject(APP_PROVIDE.REPOSITORY)
    private readonly appRepository: AppRepositoryInterface,
  ) {}

  async setExpireTTLCampaign(
    expiredAt: Date,
    _id: ObjectId | string,
  ): Promise<void> {
    const now = moment.utc();
    const expire = Math.max(1, moment.utc(expiredAt).unix() - now.unix());

    await this.campaignRedisClient.setex(
      `${REDIS_KEY.CAMPAIGN_EXPIRE}${_id.toString()}`,
      expire,
      '',
    );
  }

  async setNextRecurrentEvent(
    rruleString: string,
    _id: string,
    recurrentKey: string,
  ): Promise<void> {
    const rruleObject = rrulestr(rruleString);
    const now = new Date();
    const next = rruleObject.after(now, true);
    if (!next) {
      await this.setExpireTTLCampaign(new Date(now.getTime() + 5 * 1000), _id);
      return;
    }
    this.logger.log(`rrEvent NOW ${_id}`, now.toISOString());
    this.logger.log(`rrEvent NEXT ${_id}`, next.toISOString());

    const expire = Math.max(
      0,
      Math.floor((next.getTime() - now.getTime()) / 1000),
    );
    if (!expire) {
      this.logger.log(`rrEvent WRONG EXPIRE ${_id}`);
      await this.setExpireTTLCampaign(new Date(now.getTime() + 5 * 1000), _id);
      return;
    }

    await this.campaignRedisClient.setex(
      `${recurrentKey}${_id}`,
      //add extra seconds to not expire to early
      expire + 5,
      '',
    );
  }

  async setExpireCampaignPayment(
    paymentId: ObjectId,
    campaignId: ObjectId,
  ): Promise<void> {
    await this.campaignRedisClient.setex(
      `${REDIS_KEY.CAMPAIGN_PAYMENT_EXPIRE}${paymentId.toString()}`,
      REDIS_EXPIRE.CAMPAIGN_PAYMENT_EXPIRE,
      campaignId.toString(),
    );
  }

  async setExpireSuspendWarning({
    userReservationPermlink,
    expire,
    daysToSuspend,
    campaignId,
  }: SetExpireSuspendWarningType): Promise<void> {
    await this.campaignRedisClient.setex(
      `${REDIS_KEY.CAMPAIGN_SUSPEND_WARNING}${userReservationPermlink}${daysToSuspend}`,
      expire,
      campaignId.toString(),
    );
  }

  async setExpireAssign({
    activationPermlink,
    reservationPermlink,
    requiredObject,
    name,
    reservationTime,
  }: SetExpireAssignType): Promise<void> {
    await this.campaignRedisClient.setex(
      `${REDIS_KEY.ASSIGN_EXPIRE}${reservationPermlink}`,
      reservationTime,
      '',
    );

    await this.campaignRedisClient.set(
      `${REDIS_KEY.ASSIGN}${reservationPermlink}`,
      JSON.stringify({
        activationPermlink,
        name,
        reservationPermlink,
        requiredObject,
      }),
    );

    await this.campaignRedisClient.publish(
      REDIS_KEY.PUBLISH_EXPIRE_ASSIGN,
      reservationPermlink,
    );
  }

  async delExpireAssign(reservationPermlink: string): Promise<void> {
    await this.campaignRedisClient.deleteKey(
      `${REDIS_KEY.ASSIGN_EXPIRE}${reservationPermlink}`,
    );
    await this.campaignRedisClient.deleteKey(
      `${REDIS_KEY.ASSIGN}${reservationPermlink}`,
    );
  }

  async deleteCampaignKey(key: string): Promise<void> {
    await this.campaignRedisClient.deleteKey(key);
  }

  async getCompletedUsersInSameCampaigns({
    guideName,
    requiredObject,
    userName,
    activationPermlink,
  }: GetCompletedUsersInSameCampaignsType): Promise<GetCompletedUsersInSameCampaignsOutType> {
    const pipeline = [
      {
        $match: {
          guideName,
          requiredObject,
          activationPermlink,
          status: { $nin: ['pending'] },
          'users.name': userName,
          'users.status': { $in: ['completed', 'assigned'] },
        },
      },
      {
        $addFields: {
          completedUser: {
            $filter: {
              input: '$users',
              as: 'user',
              cond: {
                $and: [
                  { $eq: ['$$user.name', userName] },
                  { $eq: ['$$user.status', 'completed'] },
                ],
              },
            },
          },
          assignedUser: {
            $filter: {
              input: '$users',
              as: 'user',
              cond: {
                $and: [
                  { $eq: ['$$user.name', userName] },
                  { $eq: ['$$user.status', 'assigned'] },
                ],
              },
            },
          },
        },
      },
      { $project: { _id: null, completedUser: 1, assignedUser: 1 } },
    ];
    const result: AggregateSameUserReservationType =
      await this.campaignRepository.aggregate({ pipeline });
    if (_.isEmpty(result)) return { lastCompleted: null, assignedUser: false };
    return {
      lastCompleted: _.max(_.map(result[0].completedUser, 'updatedAt')) || null,
      assignedUser: !!_.last(_.get(result, '[0].assignedUser')),
    };
  }

  async getPayoutTokenRateUSD(token: string): Promise<number> {
    switch (token) {
      case PAYOUT_TOKEN.HIVE:
        return this.getHiveRateUSD();
      case PAYOUT_TOKEN.WAIV:
        return this.getEngineRateUSD();
    }
  }

  async getHiveRateUSD(): Promise<number> {
    try {
      const result = await axios.get(
        `https://${configService.getAppHost()}/currencies-api/marketInfo?ids=hive&currencies=usd`,
      );
      return _.get(result, 'data.current.hive.usd');
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async validateSponsorUrl(url: string): Promise<boolean> {
    try {
      if (url.endsWith('/')) return false;
      const urlObject = new URL(url);
      if (urlObject.pathname && urlObject.pathname !== '/') return false;
      if (urlObject.protocol !== 'https:') return false;

      const app = await this.appRepository.findOne({
        filter: {
          host: urlObject.host.replace('www.', ''),
          status: 'active',
        },
        projection: { _id: 1 },
      });

      return !!app;
    } catch (error) {
      return false;
    }
  }

  async getEngineRateUSD(symbol = 'WAIV'): Promise<number> {
    try {
      const result = await axios.get(
        `https://${configService.getAppHost()}/currencies-api/engine-rates?base=${symbol}`,
      );
      return _.get(result, 'data.current.rates.USD');
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async getWaivRateUSD(): Promise<number> {
    const pool = await this.hiveEngineClient.getMarketPool({
      tokenPair: ENGINE_MARKETPOOLS.WAIV,
    });
    const hiveRate = await this.getHiveRateUSD();
    return new BigNumber(pool.quotePrice).times(hiveRate).toNumber();
  }

  async getCurrencyInUSD(currency: string, amount: number): Promise<number> {
    if (currency === SUPPORTED_CURRENCY.USD) return amount;
    const result = await this.currencyRatesRepository.findOne({
      filter: { base: SUPPORTED_CURRENCY.USD },
      projection: { [`rates.${currency}`]: 1 },
      options: { sort: { dateString: -1 } },
    });
    return new BigNumber(amount)
      .dividedBy(_.get(result, `rates.${currency}`))
      .toNumber();
  }

  async checkOnHoldStatus(activationPermlink: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: { activationPermlink, status: CAMPAIGN_STATUS.ON_HOLD },
    });
    if (!campaign) return;
    const hasAssignedUsers = _.filter(
      campaign.users,
      (u) => u.status === RESERVATION_STATUS.ASSIGNED,
    );
    if (_.isEmpty(hasAssignedUsers)) {
      await this.campaignRepository.updateOne({
        filter: { _id: campaign._id },
        update: { status: CAMPAIGN_STATUS.INACTIVE },
      });
    }
  }

  async incrReviewComment({
    reservationPermlink,
    rootName,
    isOpen,
    author,
    permlink,
    rootPermlink,
  }: IncrReviewCommentInterface): Promise<void> {
    const state = await this.hiveClient.getState(
      rootName,
      rootPermlink || reservationPermlink,
    );

    const comments = _.filter(
      Object.values(_.get(state, 'content', {})),
      (el) => el.permlink !== rootPermlink || reservationPermlink,
    );

    const currentComment = _.find(
      comments,
      (el) => el.author === author && el.permlink === permlink,
    );

    const commentsCount = currentComment
      ? comments.length
      : comments.length + 1;

    await this.campaignRepository.updateOne({
      filter: {
        users: {
          $elemMatch: {
            ...(!rootPermlink && { rootName }),
            reservationPermlink,
          },
        },
      },
      update: {
        'users.$.commentsCount': commentsCount,
        'users.$.openConversation': isOpen,
      },
    });
  }

  async reCalcCampaignsRewardInUsd(): Promise<void> {
    const campaigns = await this.campaignRepository.find({
      filter: {
        currency: { $ne: SUPPORTED_CURRENCY.USD },
        status: { $in: [CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.PENDING] },
      },
      projection: {
        currency: 1,
        reward: 1,
        type: 1,
        contestRewards: 1,
      },
    });
    if (_.isEmpty(campaigns)) return;
    const rate = await this.currencyRatesRepository.findOne({
      filter: { base: SUPPORTED_CURRENCY.USD },
      options: { sort: { dateString: -1 } },
    });

    const { rates } = rate;

    for (const campaign of campaigns) {
      const currentRate = rates[campaign.currency];
      const rewardInUSD = new BigNumber(campaign.reward)
        .div(currentRate)
        .toNumber();

      const updateData: {
        $set: {
          rewardInUSD: number;
          contestRewards?: Array<{
            place: number;
            reward: number;
            rewardInUSD: number;
          }>;
        };
      } = { $set: { rewardInUSD } };

      // Handle contest rewards if campaign is contest type
      if (
        campaign.type === CAMPAIGN_TYPE.CONTESTS_OBJECT &&
        campaign.contestRewards?.length
      ) {
        const updatedContestRewards = campaign.contestRewards.map((reward) => ({
          ...reward,
          rewardInUSD: new BigNumber(reward.reward).div(currentRate).toNumber(),
        }));
        updateData.$set.contestRewards = updatedContestRewards;
      }

      await this.campaignRepository.updateOne({
        filter: { _id: campaign._id },
        update: updateData,
      });
    }
  }

  async reachedLimitUpdateToActive(): Promise<void> {
    await this.campaignRepository.updateMany({
      filter: { status: CAMPAIGN_STATUS.REACHED_LIMIT },
      update: { $set: { status: CAMPAIGN_STATUS.ACTIVE } },
    });
  }

  getCampaignRewardInUsd(campaign: CampaignDocumentType): number {
    if (campaign.type === CAMPAIGN_TYPE.CONTESTS_OBJECT) {
      return _.sumBy(campaign.contestRewards, 'rewardInUSD');
    }

    return campaign.rewardInUSD;
  }

  validateMinReward(params: ValidateMinRewardParams): ValidateMinRewardResult {
    const { type, rewardInUSD, contestRewards } = params;
    // const isStaging = process.env.NODE_ENV === 'staging';
    const isStaging = false;

    // Staging environment: $0.5 minimum for all types
    const STAGING_MIN_REWARD_USD = 0.5;

    // Production minimums
    const PRODUCTION_MIN_REWARD_USD = 1;
    const PRODUCTION_MIN_CONTEST_TOTAL_USD = 5;

    if (type === CAMPAIGN_TYPE.CONTESTS_OBJECT) {
      const totalRewardInUSD =
        contestRewards?.reduce(
          (sum, reward) => sum + (reward.rewardInUSD || 0),
          0,
        ) || 0;

      const minContestTotal = isStaging
        ? STAGING_MIN_REWARD_USD
        : PRODUCTION_MIN_CONTEST_TOTAL_USD;

      if (totalRewardInUSD < minContestTotal) {
        return {
          isValid: false,
          errorMessage: `The total reward amount should be at least $${minContestTotal}.`,
        };
      }
      return { isValid: true };
    }

    // Reviews, Mentions, Giveaways, Giveaways_Object
    const minReward = isStaging
      ? STAGING_MIN_REWARD_USD
      : PRODUCTION_MIN_REWARD_USD;

    if (rewardInUSD < minReward) {
      return {
        isValid: false,
        errorMessage: `Campaign is not created. Reward should be at least $${minReward}.`,
      };
    }

    return { isValid: true };
  }
}
