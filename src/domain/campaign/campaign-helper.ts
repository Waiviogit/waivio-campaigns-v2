import { Inject, Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { ObjectId } from 'mongoose';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';

import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CURRENCY_RATES_PROVIDE,
  ENGINE_MARKETPOOLS,
  HIVE_ENGINE_PROVIDE,
  PAYOUT_TOKEN,
  REDIS_EXPIRE,
  REDIS_KEY,
  REDIS_PROVIDE,
  RESERVATION_STATUS,
  SUPPORTED_CURRENCY,
} from '../../common/constants';
import { RedisClientInterface } from '../../services/redis/clients/interface';
import { CampaignHelperInterface } from './interface';
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
  ) {}

  async setExpireTTLCampaign(expiredAt: Date, _id: ObjectId): Promise<void> {
    const expire = moment.utc(expiredAt).unix() - moment.utc().unix();
    if (expire < 0) return;
    await this.campaignRedisClient.setex(
      `${REDIS_KEY.CAMPAIGN_EXPIRE}${_id.toString()}`,
      expire,
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
  }: GetCompletedUsersInSameCampaignsType): Promise<GetCompletedUsersInSameCampaignsOutType> {
    const pipeline = [
      {
        $match: {
          guideName,
          requiredObject,
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
      case PAYOUT_TOKEN.WAIV:
        return this.getHiveRateUSD();
      case PAYOUT_TOKEN.HIVE:
        return this.getWaivRateUSD();
    }
  }

  async getHiveRateUSD(): Promise<number> {
    try {
      const result = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd',
      );
      return _.get(result, 'data.hive.usd');
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
}
