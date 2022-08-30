import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';

import {
  CheckDisableType,
  CreateUpvoteRecordsType,
  GetWeightToVoteType,
  ParseHiveCustomJsonType,
  ProcessSponsorsBotVoteType,
  RewardAmountType,
  SponsorsBotApiType,
  UpdateDataAfterVoteType,
} from './type';
import {
  GetSponsorsBotInterface,
  SponsorsBotInterface,
  GetVoteAmountInterface,
  RemoveVotesOnReviewInterface,
} from './interface';
import { SPONSORS_BOT_COMMAND } from './constants';
import {
  BOT_UPVOTE_STATUS,
  CAMPAIGN_PAYMENT,
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_PROVIDE,
  HIVE_ENGINE_PROVIDE,
  HIVE_PROVIDE,
  MAX_VOTING_POWER,
  PAYOUT_TOKEN_PRECISION,
  POST_PROVIDE,
  REDIS_KEY,
  REDIS_PROVIDE,
  SPONSORS_BOT_PROVIDE,
  SPONSORS_BOT_UPVOTE_PROVIDE,
  TOKENS_PRECISION,
} from '../../common/constants';
import { SponsorsBotRepositoryInterface } from '../../persistance/sponsors-bot/interface';
import { SponsorsBotUpvoteRepositoryInterface } from '../../persistance/sponsors-bot-upvote/interface';
import { PostRepositoryInterface } from '../../persistance/post/interface';
import { HiveEngineClientInterface } from '../../services/hive-engine-api/interface';
import { calculateMana } from '../../common/helpers';
import { GetUpvoteType } from '../../persistance/sponsors-bot-upvote/type';
import { CalculateManaType } from '../../common/helpers/types';
import { HiveClientInterface } from '../../services/hive-api/interface';
import { EngineVoteType } from '../engine-parser/types';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { RedisClientInterface } from '../../services/redis/clients/interface';
import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';

@Injectable()
export class SponsorsBot implements SponsorsBotInterface {
  constructor(
    @Inject(SPONSORS_BOT_PROVIDE.REPOSITORY)
    private readonly sponsorsBotRepository: SponsorsBotRepositoryInterface,
    @Inject(SPONSORS_BOT_UPVOTE_PROVIDE.REPOSITORY)
    private readonly sponsorsBotUpvoteRepository: SponsorsBotUpvoteRepositoryInterface,
    @Inject(POST_PROVIDE.REPOSITORY)
    private readonly postRepository: PostRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(HIVE_ENGINE_PROVIDE.CLIENT)
    private readonly hiveEngineClient: HiveEngineClientInterface,
    @Inject(HIVE_PROVIDE.CLIENT)
    private readonly hiveClient: HiveClientInterface,
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPaymentRepository: CampaignPaymentRepositoryInterface,
  ) {}

  async parseHiveCustomJson({
    id,
    authorizedUser,
    json,
    transaction_id,
  }: ParseHiveCustomJsonType): Promise<void> {
    switch (id) {
      case SPONSORS_BOT_COMMAND.SET_RULE:
        const expired = moment(json.expiredAt).utc().toDate();
        const tomorrow = moment().utc().add(1, 'days').startOf('day').toDate();
        if (json.sponsor && (!json.expiredAt || expired >= tomorrow)) {
          await this.sponsorsBotRepository.setSponsorsBot({
            botName: authorizedUser,
            sponsor: json.sponsor,
            votingPercent: json.votingPercent,
            enabled: json.enabled,
            note: json.note,
            expiredAt: json.expiredAt
              ? moment(json.expiredAt).utc().startOf('day').toDate()
              : null,
          });
        }
        await this.campaignRedisClient.publish(
          REDIS_KEY.PUBLISH_EXPIRE_TRX_ID,
          transaction_id,
        );
        break;
      case SPONSORS_BOT_COMMAND.REMOVE_RULE:
        if (json.sponsor) {
          await this.sponsorsBotRepository.removeRule({
            botName: authorizedUser,
            sponsor: json.sponsor,
          });
        }
        await this.campaignRedisClient.publish(
          REDIS_KEY.PUBLISH_EXPIRE_TRX_ID,
          transaction_id,
        );
        break;
      case SPONSORS_BOT_COMMAND.CHANGE_POWER:
        if (json.votingPower) {
          await this.sponsorsBotRepository.setVotingPower({
            botName: authorizedUser,
            minVotingPower: json.votingPower,
          });
        }
        await this.campaignRedisClient.publish(
          REDIS_KEY.PUBLISH_EXPIRE_TRX_ID,
          transaction_id,
        );
        break;
    }
  }

  async checkDisable({
    botName,
    accountAuths,
  }: CheckDisableType): Promise<void> {
    if (
      this.isAccountsIncludeBot(process.env.SPONSORS_BOT_NAME, accountAuths)
    ) {
      return;
    }
    const bots = await this.sponsorsBotRepository.getSponsorsBot({
      botName,
      limit: 1,
    });

    if (!_.isEmpty(bots.results)) {
      await this.sponsorsBotRepository.updateStatus({
        botName: botName,
        enabled: false,
      });
    }
  }

  isAccountsIncludeBot(
    botName: string,
    accountAuths: [string, number][],
  ): boolean {
    return _.flattenDepth(accountAuths).includes(botName);
  }

  async createUpvoteRecords({
    campaign,
    botName,
    permlink,
  }: CreateUpvoteRecordsType): Promise<void> {
    const tokenPrecision = PAYOUT_TOKEN_PRECISION[campaign.payoutToken];

    const rewardInToken = new BigNumber(campaign.rewardInUSD)
      .dividedBy(campaign.payoutTokenRateUSD)
      .decimalPlaces(tokenPrecision);

    for (const matchBot of campaign.matchBots) {
      const bot = await this.sponsorsBotRepository.findOne({
        filter: {
          'sponsors.sponsor': campaign.guideName,
          botName: matchBot,
          'sponsors.enabled': true,
        },
      });
      if (!bot) continue;
      const sponsorsPermissions = _.find(
        bot.sponsors,
        (record) => record.sponsor === campaign.guideName,
      );

      const reward = rewardInToken.times(2).decimalPlaces(tokenPrecision);

      const amountToVote = reward
        .times(sponsorsPermissions.votingPercent)
        .decimalPlaces(tokenPrecision);

      await this.sponsorsBotUpvoteRepository.create({
        requiredObject: campaign.requiredObject,
        symbol: campaign.payoutToken,
        reservationPermlink: campaign.userReservationPermlink,
        botName: bot.botName,
        author: botName || campaign.userName,
        sponsor: campaign.guideName,
        permlink,
        amountToVote: amountToVote.toNumber(),
        reward: reward.toNumber(),
      });
    }
  }

  async executeUpvotes(): Promise<void> {
    const upvotes = await this.sponsorsBotUpvoteRepository.getUpvotes();
    for (const upvote of upvotes) {
      const post = await this.postRepository.findOne({
        filter: {
          $or: [
            { author: upvote.author, permlink: upvote.permlink },
            { root_author: upvote.author, permlink: upvote.permlink },
          ],
        },
      });

      if (
        post &&
        post.active_votes &&
        _.map(post.active_votes, 'voter').includes(upvote.botName)
      ) {
        return;
      }
      const votingPowers = await this.getVotingPowers(upvote);

      if (votingPowers.votingPower < upvote.minVotingPower) return;
      const weight = await this.getWeightToVote({
        amount: upvote.amountToVote,
        symbol: upvote.symbol,
        votingPower: votingPowers.votingPower,
        account: upvote.botName,
        maxVoteWeight: upvote.votingPercent * 10000,
      });

      const { authorReward, curationReward } = await this.getVoteAmount({
        votingPower: votingPowers.votingPower,
        weight,
        symbol: upvote.symbol,
        account: upvote.botName,
      });
      if (authorReward.eq(0)) return;

      const vote = await this.hiveClient.voteOnPost({
        key: process.env.SPONSORS_BOT_KEY,
        author: upvote.author,
        permlink: upvote.permlink,
        voter: upvote.botName,
        weight,
      });
      if (vote) {
        await this.updateDataAfterVote({
          upvote,
          weight,
          authorReward,
          curationReward,
        });
      }
    }
  }

  async getWeightToVote({
    amount,
    symbol,
    votingPower,
    account,
    maxVoteWeight,
  }: GetWeightToVoteType): Promise<number> {
    const { stake, delegationsIn } =
      await this.hiveEngineClient.getTokenBalance(account, symbol);
    const { rewardPool, pendingClaims } =
      await this.hiveEngineClient.getRewardPool(symbol);

    const rewards = new BigNumber(rewardPool).dividedBy(pendingClaims);
    const finalRshares = new BigNumber(stake).plus(delegationsIn);

    const reverseRshares = new BigNumber(amount).dividedBy(rewards);

    const reversePower = reverseRshares
      .times(MAX_VOTING_POWER)
      .dividedBy(finalRshares);

    const weight = reversePower
      .times(MAX_VOTING_POWER)
      .dividedBy(votingPower)
      .integerValue()
      .toNumber();

    return weight > maxVoteWeight ? maxVoteWeight : weight;
  }

  async getVoteAmount({
    votingPower,
    weight,
    account,
    symbol,
  }: GetVoteAmountInterface): Promise<RewardAmountType> {
    const onError = {
      curationReward: new BigNumber(0),
      authorReward: new BigNumber(0),
    };
    const rewardsPool = await this.hiveEngineClient.getRewardPool(symbol);
    const balances = await this.hiveEngineClient.getTokenBalance(
      account,
      symbol,
    );
    if (rewardsPool?.error) return onError;
    if (balances?.error) return onError;
    const { rewardPool, pendingClaims, config } = rewardsPool;
    const { stake, delegationsIn } = balances;

    const rewards = new BigNumber(rewardPool).div(pendingClaims);
    const finalRshares = new BigNumber(stake).plus(delegationsIn);
    const power = new BigNumber(votingPower).times(weight).div(10000);
    const rshares = power.times(finalRshares).div(10000);

    const totalTokenAmount = rshares.times(rewards);

    const curationReward = new BigNumber(config.curationRewardPercentage)
      .div(100)
      .times(totalTokenAmount)
      .dp(TOKENS_PRECISION[symbol]);
    const authorReward = totalTokenAmount
      .minus(curationReward)
      .dp(TOKENS_PRECISION[symbol]);

    return {
      curationReward,
      authorReward,
    };
  }

  async getVotingPowers(upvote: GetUpvoteType): Promise<CalculateManaType> {
    const votingPower = await this.hiveEngineClient.getVotingPower(
      upvote.botName,
      upvote.symbol,
    );
    return calculateMana(votingPower);
  }

  async updateDataAfterVote({
    upvote,
    weight,
    authorReward,
    curationReward,
  }: UpdateDataAfterVoteType): Promise<void> {
    await this.sponsorsBotUpvoteRepository.updateStatus({
      _id: upvote._id,
      status: BOT_UPVOTE_STATUS.UPVOTED,
      currentVote: authorReward.plus(curationReward).toNumber(),
      voteWeight: weight,
    });

    await this.sponsorsBotUpvoteRepository.updateMany({
      filter: { author: upvote.author, permlink: upvote.permlink },
      update: { $inc: { totalVotesWeight: authorReward.toNumber() } },
    });

    await this.campaignPaymentRepository.updateOne({
      filter: {
        type: CAMPAIGN_PAYMENT.REVIEW,
        userName: upvote.author,
        reviewPermlink: upvote.permlink,
      },
      update: {
        $inc: { votesAmount: authorReward },
      },
    });
  }

  async parseVotes(votes: EngineVoteType[]): Promise<void> {
    await Promise.all(
      votes.map(async (vote) => {
        const campaign = await this.campaignRepository.findOne({
          filter: {
            $or: [{ guideName: vote.voter }, { match_bots: vote.voter }],
            users: {
              $elemMatch: {
                reviewPermlink: vote.permlink,
                rootAuthor: vote.author,
              },
            },
          },
        });
        if (!campaign && vote.weight < 0) {
          const campaignWithReview = await this.campaignRepository.findOne({
            filter: {
              users: {
                $elemMatch: {
                  reviewPermlink: vote.permlink,
                  rootAuthor: vote.author,
                },
              },
            },
          });
          if (!campaignWithReview) return;
          const post = await this.hiveClient.getContent(
            vote.author,
            vote.permlink,
          );
          if (
            !post.author ||
            moment.utc(post.created) < moment.utc().subtract(7, 'days')
          ) {
            return;
          }
          const expirationTime = moment
            .utc(post.created)
            .add(167, 'hours')
            .valueOf();
          const ttlTime = Math.round(
            (expirationTime - moment.utc().valueOf()) / 1000,
          );
          if (ttlTime < 0) return;
          await this.campaignRedisClient.setex(
            `${REDIS_KEY.REVIEW_DOWNVOTE}|${vote.author}|${vote.permlink}`,
            ttlTime,
            '',
          );
        } else if (campaign) {
          await this.campaignRedisClient.setex(
            `${REDIS_KEY.SPONSOR_BOT_VOTE}|${vote.author}|${vote.permlink}|${vote.voter}`,
            20,
            '',
          );
        }
      }),
    );
  }

  async expireListener(msg: string): Promise<void> {
    const data = msg.split('|');
    switch (data[0]) {
      case REDIS_KEY.SPONSOR_BOT_VOTE:
        await this.processSponsorsBotVote({
          author: data[1],
          permlink: data[2],
          voter: data[3],
        });
        break;
      case REDIS_KEY.REVIEW_DOWNVOTE:
        break;
    }
  }

  async processSponsorsBotVote({
    author,
    permlink,
    voter,
  }: ProcessSponsorsBotVoteType): Promise<void> {
    // const upvote = await this.sponsorsBotUpvoteRepository.findOne({
    //   filter: { author, permlink, botName: voter },
    // });
    // if (!upvote) {
    // }
  }

  async getSponsorsBot({
    botName,
    symbol,
    skip,
    limit,
  }: GetSponsorsBotInterface): Promise<SponsorsBotApiType> {
    const bot = await this.sponsorsBotRepository.findOne({
      filter: { botName, symbol },
      projection: { sponsors: { $slice: [skip, limit] } },
    });

    const mappedData =
      bot &&
      bot.sponsors.map((sponsor) => ({
        botName: bot.botName,
        minVotingPower: bot.minVotingPower,
        sponsor: sponsor.sponsor,
        note: sponsor.note,
        enabled: sponsor.enabled,
        votingPercent: sponsor.votingPercent,
        expiredAt: sponsor.expiredAt,
      }));

    return {
      results: mappedData || [],
      minVotingPower: _.get(bot, 'minVotingPower', 0),
    };
  }

  async removeVotesOnReview({
    reservationPermlink,
  }: RemoveVotesOnReviewInterface): Promise<void> {
    const upvotes = await this.sponsorsBotUpvoteRepository.find({
      filter: { reservationPermlink },
    });
    if (_.isEmpty(upvotes)) return;

    for (const upvote of upvotes) {
      if (upvote.status === BOT_UPVOTE_STATUS.PENDING) continue;
      const vote = await this.hiveClient.voteOnPost({
        key: process.env.SPONSORS_BOT_KEY,
        author: upvote.author,
        permlink: upvote.permlink,
        voter: upvote.botName,
        weight: 0,
      });
    }
    await this.sponsorsBotUpvoteRepository.updateMany({
      filter: { reservationPermlink },
      update: {
        status: BOT_UPVOTE_STATUS.REJECTED,
        totalVotesWeight: 0,
        currentVote: 0,
        voteWeight: 0,
      },
    });
  }
}
