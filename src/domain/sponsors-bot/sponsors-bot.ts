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
  GetVoteAmountFromRsharesInterface,
  ProcessDownvoteOnReviewInterface,
  UpdateDownVoteNoActiveInterface,
  GetVotingPowersInterface,
  UpdateSponsorsCurrentVote,
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
  RESERVATION_STATUS,
  SPONSORS_BOT_PROVIDE,
  SPONSORS_BOT_UPVOTE_PROVIDE,
  TOKENS_PRECISION,
} from '../../common/constants';
import { SponsorsBotRepositoryInterface } from '../../persistance/sponsors-bot/interface';
import { SponsorsBotUpvoteRepositoryInterface } from '../../persistance/sponsors-bot-upvote/interface';
import { PostRepositoryInterface } from '../../persistance/post/interface';
import { HiveEngineClientInterface } from '../../services/hive-engine-api/interface';
import { calculateMana } from '../../common/helpers';
import { CalculateManaType } from '../../common/helpers/types';
import { HiveClientInterface } from '../../services/hive-api/interface';
import { EngineVoteType } from '../engine-parser/types';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { RedisClientInterface } from '../../services/redis/clients/interface';
import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';
import { sumBy } from '../../common/helpers/calc-helper';

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
    rewardInToken,
  }: CreateUpvoteRecordsType): Promise<void> {
    const tokenPrecision = PAYOUT_TOKEN_PRECISION[campaign.payoutToken];
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

  async getVoteAmountFromRshares({
    rshares,
    symbol,
  }: GetVoteAmountFromRsharesInterface): Promise<RewardAmountType> {
    const rewardsPool = await this.hiveEngineClient.getRewardPool(symbol);
    const { rewardPool, pendingClaims, config } = rewardsPool;
    const rewards = new BigNumber(rewardPool).div(pendingClaims);
    const totalTokenAmount = rewards.times(rshares);
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
      rshares,
    };
  }

  async getVotingPowers({
    botName,
    symbol,
  }: GetVotingPowersInterface): Promise<CalculateManaType> {
    const votingPower = await this.hiveEngineClient.getVotingPower(
      botName,
      symbol,
    );
    return calculateMana(votingPower);
  }

  async updateDataAfterVote({
    upvote,
    weight,
    authorReward,
  }: UpdateDataAfterVoteType): Promise<void> {
    await this.sponsorsBotUpvoteRepository.updateStatus({
      _id: upvote._id,
      status: BOT_UPVOTE_STATUS.UPVOTED,
      currentVote: authorReward.toNumber(),
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
        await this.processDownvoteOnReview({
          author: data[1],
          permlink: data[2],
        });
        break;
      case REDIS_KEY.SPONSOR_BOT_CURRENT_VOTE:
        await this.updateSponsorsCurrentVote({
          author: data[1],
          permlink: data[2],
        });
        break;
    }
  }

  async updateSponsorsCurrentVote({
    author,
    permlink,
  }: UpdateSponsorsCurrentVote): Promise<void> {
    const upvotes = await this.sponsorsBotUpvoteRepository.find({
      filter: { author, permlink },
    });
    if (_.isEmpty(upvotes)) return;
    const totalWeight = _.get(upvotes, '[0].totalVotesWeight', 0);
    const symbol = upvotes[0].symbol;
    if (totalWeight === 0) {
      await this.sponsorsBotUpvoteRepository.updateMany({
        filter: { author, permlink },
        update: { currentVote: 0, voteWeight: 0 },
      });
      return;
    }
    const votes = await this.hiveEngineClient.getActiveVotes({
      author,
      permlink,
      symbol,
    });
    const botNames = _.map(upvotes, 'botName');
    const botsRshares = sumBy({
      arr: _.filter(votes, (v) => botNames.includes(v.voter)),
      callback: (vote) => _.get(vote, 'rshares', 0),
      dp: PAYOUT_TOKEN_PRECISION[symbol],
    });
    for (const upvote of upvotes) {
      const vote = votes.find((v) => v.voter === upvote.botName);
      if (!vote) continue;
      const currentVote = new BigNumber(vote.rshares)
        .times(totalWeight)
        .div(botsRshares)
        .dp(PAYOUT_TOKEN_PRECISION[symbol])
        .toNumber();
      await this.sponsorsBotUpvoteRepository.updateStatus({
        _id: upvote._id,
        status: BOT_UPVOTE_STATUS.UPVOTED,
        currentVote,
        voteWeight: vote.weight,
      });
    }
  }

  async processDownvoteOnReview({
    author,
    permlink,
  }: ProcessDownvoteOnReviewInterface): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        users: {
          $elemMatch: { reviewPermlink: permlink, rootAuthor: author },
        },
      },
      projection: {
        'users.$': 1,
        payoutToken: 1,
        guideName: 1,
        requiredObject: 1,
      },
    });
    if (!campaign) return;
    if (_.get(campaign, 'users[0].status') !== RESERVATION_STATUS.COMPLETED) {
      return;
    }

    const votes = await this.hiveEngineClient.getActiveVotes({
      author,
      permlink,
      symbol: campaign.payoutToken,
    });

    const negativeRshares = sumBy({
      arr: _.filter(votes, (v) => v.weight < 0),
      callback: (vote) => _.get(vote, 'rshares', 0),
      dp: PAYOUT_TOKEN_PRECISION[campaign.payoutToken],
    });
    if (negativeRshares === 0) return;
    const upvotes = await this.sponsorsBotUpvoteRepository.find({
      filter: { author, permlink },
    });
    if (_.isEmpty(upvotes)) return;
    const botNames = _.map(upvotes, 'botName');
    const bots = await this.sponsorsBotRepository.find({
      filter: { botName: { $in: botNames }, symbol: campaign.payoutToken },
    });
    const botsRshares = sumBy({
      arr: _.filter(votes, (v) => botNames.includes(v.voter)),
      callback: (vote) => _.get(vote, 'rshares', 0),
      dp: PAYOUT_TOKEN_PRECISION[campaign.payoutToken],
    });
    const activeBots = _.filter(
      bots,
      (b) =>
        !!_.find(
          b.sponsors,
          (s) => s.sponsor === campaign.guideName && s.enabled,
        ),
    );

    if (_.isEmpty(activeBots)) {
      return this.updateDownVoteNoActive({
        negativeRshares,
        botsRshares,
        permlink,
        author,
        symbol: campaign.payoutToken,
      });
    }
    for (const activeBot of activeBots) {
      const sponsor = _.find(
        activeBot.sponsors,
        (s) => s.sponsor === campaign.guideName,
      );
      const upvote = _.find(upvotes, (u) => u.botName === activeBot.botName);
      const botVoteEngine = votes.find((v) => v.voter === activeBot.botName);
      if (!upvote || !sponsor || !botVoteEngine) continue;
      activeBot.addRshares = botVoteEngine.rshares;
      const votingPowers = await this.getVotingPowers({
        botName: activeBot.botName,
        symbol: activeBot.symbol,
      });
      if (votingPowers.votingPower < activeBot.minVotingPower) continue;
      const { authorReward: negAuthor, curationReward: negCuration } =
        await this.getVoteAmountFromRshares({
          rshares: new BigNumber(negativeRshares).abs().toFixed(),
          symbol: activeBot.symbol,
        });

      const weight = await this.getWeightToVote({
        amount: new BigNumber(upvote.amountToVote)
          .plus(negAuthor)
          .plus(negCuration)
          .toNumber(),
        symbol: activeBot.symbol,
        votingPower: votingPowers.votingPower,
        account: activeBot.botName,
        maxVoteWeight: sponsor.votingPercent * 10000,
      });
      const { rshares } = await this.getVoteAmount({
        votingPower: votingPowers.votingPower,
        weight,
        symbol: upvote.symbol,
        account: upvote.botName,
      });
      if (rshares.lte(activeBot.addRshares)) continue;
      const diffRshares = rshares.minus(activeBot.addRshares);
      activeBot.addRshares = diffRshares.plus(activeBot.addRshares).toFixed();
      activeBot.vote = true;
      activeBot.weight = weight;
    }
    const activeBotNames = _.map(activeBots, 'botName');
    const notActiveRshares = sumBy({
      arr: _.filter(votes, (v) => !activeBotNames.includes(v.voter)),
      callback: (vote) => _.get(vote, 'rshares', 0),
      dp: PAYOUT_TOKEN_PRECISION[campaign.payoutToken],
    });
    const additionalRshares = sumBy({
      arr: activeBots,
      callback: (bot) => _.get(bot, 'addRshares', 0),
      dp: PAYOUT_TOKEN_PRECISION[campaign.payoutToken],
    });
    const totalRsharesToUpdate = new BigNumber(additionalRshares).plus(
      notActiveRshares,
    );
    if (totalRsharesToUpdate.lte(negativeRshares)) {
      for (const botUnVote of activeBotNames) {
        await this.hiveClient.voteOnPost({
          key: process.env.SPONSORS_BOT_KEY,
          author: author,
          permlink: permlink,
          voter: botUnVote,
          weight: 0,
        });
      }
      return this.updateDownvoteZero(author, permlink, new BigNumber(0));
    }
    const { authorReward: newReward } = await this.getVoteAmountFromRshares({
      rshares: new BigNumber(totalRsharesToUpdate).toFixed(),
      symbol: campaign.payoutToken,
    });
    for (const newVoteActive of activeBots) {
      await this.hiveClient.voteOnPost({
        key: process.env.SPONSORS_BOT_KEY,
        author: author,
        permlink: permlink,
        voter: newVoteActive.botName,
        weight: newVoteActive.weight,
      });
    }
    return this.updateDownvoteZero(author, permlink, newReward);
  }

  async updateDownVoteNoActive({
    negativeRshares,
    botsRshares,
    permlink,
    author,
    symbol,
  }: UpdateDownVoteNoActiveInterface): Promise<void> {
    const rsharesDiff = new BigNumber(botsRshares).plus(negativeRshares);
    if (rsharesDiff.lte(0)) {
      return this.updateDownvoteZero(author, permlink, new BigNumber(0));
    }
    const { authorReward } = await this.getVoteAmountFromRshares({
      rshares: rsharesDiff.toFixed(),
      symbol: symbol,
    });
    return this.updateDownvoteZero(author, permlink, authorReward);
  }

  async updateDownvoteZero(
    author: string,
    permlink: string,
    amount: BigNumber,
  ): Promise<void> {
    await this.sponsorsBotUpvoteRepository.updateMany({
      filter: { author, permlink },
      update: {
        totalVotesWeight: amount.toNumber(),
      },
    });

    await this.campaignPaymentRepository.updateOne({
      filter: {
        type: CAMPAIGN_PAYMENT.REVIEW,
        userName: author,
        reviewPermlink: permlink,
      },
      update: {
        votesAmount: amount,
      },
    });
    await this.campaignRedisClient.setex(
      `${REDIS_KEY.SPONSOR_BOT_CURRENT_VOTE}|${author}|${permlink}`,
      100,
      '',
    );
  }

  async processVoteWithoutRecord({
    author,
    permlink,
    voter,
  }: ProcessSponsorsBotVoteType): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        users: {
          $elemMatch: { reviewPermlink: permlink, rootAuthor: author },
        },
      },
      projection: {
        'users.$': 1,
        payoutToken: 1,
        guideName: 1,
        requiredObject: 1,
      },
    });
    if (!campaign) return;
    if (_.get(campaign, 'users[0].status') !== RESERVATION_STATUS.COMPLETED) {
      return;
    }
    const payment = await this.campaignPaymentRepository.findOne({
      filter: {
        reviewPermlink: permlink,
        payoutToken: campaign.payoutToken,
        type: CAMPAIGN_PAYMENT.REVIEW,
      },
    });
    if (!payment) return;
    const vote = await this.hiveEngineClient.getVote({
      author,
      permlink,
      voter,
      symbol: campaign.payoutToken,
    });
    if (!vote) return;
    if (vote.weight <= 0) return;
    const { authorReward } = await this.getVoteAmountFromRshares({
      rshares: vote.rshares,
      symbol: campaign.payoutToken,
    });

    await this.sponsorsBotUpvoteRepository.create({
      status: BOT_UPVOTE_STATUS.UPVOTED,
      requiredObject: campaign.requiredObject,
      symbol: campaign.payoutToken,
      reservationPermlink: _.get(campaign, 'users[0].reservationPermlink'),
      botName: voter,
      author: _.get(campaign, 'users[0].name'),
      sponsor: campaign.guideName,
      permlink,
      amountToVote: new BigNumber(payment.amount).times(2).toNumber(),
      reward: new BigNumber(payment.amount).times(2).toNumber(),
      currentVote: authorReward.toNumber(),
      voteWeight: vote.weight,
    });

    await this.sponsorsBotUpvoteRepository.updateMany({
      filter: { author, permlink },
      update: { $inc: { totalVotesWeight: authorReward.toNumber() } },
    });

    await this.campaignPaymentRepository.updateOne({
      filter: {
        type: CAMPAIGN_PAYMENT.REVIEW,
        userName: author,
        reviewPermlink: permlink,
      },
      update: {
        $inc: { votesAmount: authorReward },
      },
    });
  }

  async processSponsorsBotVote({
    author,
    permlink,
    voter,
  }: ProcessSponsorsBotVoteType): Promise<void> {
    const upvote = await this.sponsorsBotUpvoteRepository.findOne({
      filter: { author, permlink, botName: voter },
    });
    if (!upvote) {
      return this.processVoteWithoutRecord({ author, permlink, voter });
    }
    if (upvote.status === BOT_UPVOTE_STATUS.REJECTED) return;

    const vote = await this.hiveEngineClient.getVote({
      author,
      permlink,
      voter,
      symbol: upvote.symbol,
    });
    if (!vote) return;

    if (upvote.voteWeight === vote.weight) return;
    const { authorReward } = await this.getVoteAmountFromRshares({
      rshares: vote.rshares,
      symbol: upvote.symbol,
    });

    const amountDiff = new BigNumber(upvote.currentVote)
      .minus(authorReward)
      .abs();
    const incrementAmount = new BigNumber(upvote.currentVote).gt(authorReward)
      ? amountDiff.negated()
      : amountDiff;

    await this.sponsorsBotUpvoteRepository.updateStatus({
      _id: upvote._id,
      status: BOT_UPVOTE_STATUS.UPVOTED,
      currentVote: authorReward.toNumber(),
      voteWeight: vote.weight,
    });

    await this.sponsorsBotUpvoteRepository.updateMany({
      filter: { author: upvote.author, permlink: upvote.permlink },
      update: { $inc: { totalVotesWeight: incrementAmount.toNumber() } },
    });

    await this.campaignPaymentRepository.updateOne({
      filter: {
        type: CAMPAIGN_PAYMENT.REVIEW,
        userName: upvote.author,
        reviewPermlink: upvote.permlink,
      },
      update: {
        $inc: { votesAmount: incrementAmount },
      },
    });
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
      await this.hiveClient.voteOnPost({
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
