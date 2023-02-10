import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import * as moment from 'moment';
import {
  APP_PROVIDE,
  CAMPAIGN_FIELDS,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_SORTS,
  CAMPAIGN_STATUS,
  COLLECTION,
  RESERVATION_STATUS,
  USER_PROVIDE,
  WOBJECT_PROVIDE,
  REWARDS_TAB,
  CAMPAIGN_PAYMENT_PROVIDE,
  TOKEN_WAIV,
  REDIS_PROVIDE,
  REDIS_KEY,
  REWARDS_PROVIDE,
  WOBJECT_STATUS,
  WOBJECT_SUBSCRIPTION_PROVIDE,
  USER_SUBSCRIPTION_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  CanReserveParamType,
  CanReserveType,
  ExpertiseVariablesType,
  GetEligiblePipeType,
  GetPrimaryObjectRewards,
  GetReservedType,
  GetRewardsByRequiredObjectType,
  GetRewardsEligibleType,
  GetRewardsMainType,
  GetSortedCampaignMainType,
  GetSponsorsType,
  RewardsAllType,
  RewardsByObjectType,
  RewardsByRequiredType,
  RewardsMainType,
  RewardsTabType,
} from './types';
import { WobjectHelperInterface } from '../../wobject/interface';
import { AppRepositoryInterface } from '../../../persistance/app/interface';
import {
  GetReservedFiltersInterface,
  GetSponsorsAllInterface,
  GetSponsorsEligibleInterface,
  RewardsAllInterface,
  RewardsHelperInterface,
} from './interface';
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import { configService } from '../../../common/config';
import { GuidePaymentsQueryInterface } from '../../campaign-payment/interface';
import { AddDataOnRewardsByObjectType } from '../../campaign-payment/types';
import { PipelineStage } from 'mongoose';
import { RedisClientInterface } from '../../../services/redis/clients/interface';
import { WobjectSubscriptionsRepositoryInterface } from '../../../persistance/wobject-subscriptions/interface';
import { UserSubscriptionRepositoryInterface } from '../../../persistance/user-subscriptions/interface';

@Injectable()
export class RewardsAll implements RewardsAllInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.GUIDE_PAYMENTS_Q)
    private readonly guidePaymentsQuery: GuidePaymentsQueryInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
    @Inject(APP_PROVIDE.REPOSITORY)
    private readonly appRepository: AppRepositoryInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(REDIS_PROVIDE.BLOCK_CLIENT)
    private readonly redisBlockClient: RedisClientInterface,
    @Inject(REWARDS_PROVIDE.HELPER)
    private readonly rewardsHelper: RewardsHelperInterface,
    @Inject(WOBJECT_SUBSCRIPTION_PROVIDE.REPOSITORY)
    private readonly wobjectSubscriptionsRepository: WobjectSubscriptionsRepositoryInterface,
    @Inject(USER_SUBSCRIPTION_PROVIDE.REPOSITORY)
    private readonly userSubscriptionRepository: UserSubscriptionRepositoryInterface,
  ) {}

  async findAssignedMainObjects(userName: string): Promise<string[]> {
    if (!userName) return [];
    const campaigns = await this.campaignRepository.find({
      filter: {
        users: {
          $elemMatch: { name: userName, status: RESERVATION_STATUS.ASSIGNED },
        },
      },
      projection: { requiredObject: 1 },
    });
    return _.uniq(_.map(campaigns, 'requiredObject'));
  }

  async canReserve({
    userName,
    activationPermlink,
  }: CanReserveParamType): Promise<CanReserveType> {
    const errResponse = {
      canAssignByBudget: false,
      canAssignByCurrentDay: false,
      posts: false,
      followers: false,
      expertise: false,
      notAssigned: false,
      frequency: false,
      notBlacklisted: false,
      notGuide: false,
    };
    if (!userName) return errResponse;

    const user = await this.userRepository.findOne({
      filter: { name: userName },
      projection: { count_posts: 1, followers_count: 1, wobjects_weight: 1 },
    });
    if (!user) return errResponse;
    const eligiblePipe = await this.getEligiblePipe({ userName, user });
    eligiblePipe.pop();
    const reserve: CanReserveType[] = await this.campaignRepository.aggregate({
      pipeline: [
        {
          $match: {
            status: CAMPAIGN_STATUS.ACTIVE,
            activationPermlink,
          },
        },
        ...eligiblePipe,
        {
          $project: {
            canAssignByBudget: 1,
            canAssignByCurrentDay: 1,
            posts: 1,
            followers: 1,
            expertise: 1,
            notAssigned: 1,
            frequency: 1,
            notBlacklisted: { $not: { $in: [userName, '$blacklist'] } },
            notGuide: { $not: { $eq: [userName, '$guideName'] } },
          },
        },
      ],
    });
    if (!reserve || !reserve.length) return errResponse;
    return reserve[0];
  }

  async getRewardsTab(userName: string): Promise<RewardsTabType> {
    const { rewards } = await this.getReserved({
      userName,
      skip: 0,
      limit: 1,
      host: configService.getAppHost(),
    });
    if (rewards.length) return { tabType: REWARDS_TAB.RESERVED };
    return { tabType: REWARDS_TAB.GLOBAL };
  }

  async getReservedFilters({
    userName,
  }: GetReservedFiltersInterface): Promise<GetSponsorsType> {
    const sponsors: GetSponsorsType[] = await this.campaignRepository.aggregate(
      {
        pipeline: [
          {
            $match: {
              'users.status': RESERVATION_STATUS.ASSIGNED,
              'users.name': userName,
            },
          },
          {
            $group: {
              _id: null,
              type: { $addToSet: '$type' },
              sponsors: { $addToSet: '$guideName' },
              reach: { $addToSet: '$reach' },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ],
      },
    );
    if (_.isEmpty(sponsors)) return { type: [], sponsors: [], reach: [] };
    return sponsors[0];
  }

  async getReserved({
    userName,
    skip,
    limit,
    host,
    sort,
    area,
    type,
    sponsors,
  }: GetReservedType): Promise<RewardsByObjectType> {
    const campaigns: CampaignDocumentType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              users: {
                $elemMatch: {
                  status: RESERVATION_STATUS.ASSIGNED,
                  name: userName,
                },
              },
              ...(sponsors && { guideName: { $in: sponsors } }),
              ...(type && { type: { $in: type } }),
            },
          },
          {
            $addFields: {
              users: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$users',
                      as: 'user',
                      cond: {
                        $and: [
                          {
                            $eq: ['$$user.status', RESERVATION_STATUS.ASSIGNED],
                          },
                          { $eq: ['$$user.name', userName] },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
        ],
      });

    const rewards = await this.rewardsHelper.fillUserReservations({
      campaigns,
      area,
      sort,
      host,
    });

    return {
      rewards: rewards.slice(skip, skip + limit),
      hasMore: rewards.slice(skip).length > limit,
    };
  }

  async getRewardsEligibleMain({
    skip,
    limit,
    host,
    sponsors,
    type,
    sort,
    area,
    userName,
    activationPermlink,
    radius,
    reach,
  }: GetRewardsEligibleType): Promise<RewardsAllType> {
    const user = await this.userRepository.findOne({
      filter: { name: userName },
      projection: { count_posts: 1, followers_count: 1, wobjects_weight: 1 },
    });
    if (!user) return { rewards: [], hasMore: false };
    const campaigns: CampaignDocumentType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              status: CAMPAIGN_STATUS.ACTIVE,
              ...(sponsors && { guideName: { $in: sponsors } }),
              ...(type && { type: { $in: type } }),
              ...(activationPermlink && { activationPermlink }),
              ...(reach && { reach }),
            },
          },
          ...(await this.getEligiblePipe({
            userName,
            user,
          })),
        ],
      });
    return this.getPrimaryObjectRewards({
      skip,
      limit,
      host,
      sort,
      area,
      campaigns,
      radius,
    });
  }

  async getUserRewards({
    skip,
    limit,
    host,
    sort,
    area,
    userName,
    radius,
  }: GetRewardsEligibleType): Promise<RewardsAllType> {
    const user = await this.userRepository.findOne({
      filter: { name: userName },
      projection: { count_posts: 1, followers_count: 1, wobjects_weight: 1 },
    });
    if (!user) return { rewards: [], hasMore: false };
    const wobjectSubs = await this.wobjectSubscriptionsRepository.find({
      filter: { follower: userName },
    });
    const usersSubs = await this.userSubscriptionRepository.find({
      filter: { follower: userName },
    });

    const usersList = _.map(usersSubs, 'following');
    const objectsList = _.map(wobjectSubs, 'following');

    const campaigns: CampaignDocumentType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              status: CAMPAIGN_STATUS.ACTIVE,
              $or: [
                { guideName: { $in: usersList } },
                { requiredObject: { $in: objectsList } },
              ],
            },
          },
          ...(await this.getEligiblePipe({
            userName,
            user,
          })),
        ],
      });

    return this.getPrimaryObjectRewards({
      skip,
      limit,
      host,
      sort,
      area,
      campaigns,
      radius,
    });
  }

  async getEligibleByObject({
    skip,
    limit,
    host,
    sponsors,
    type,
    userName,
    requiredObject,
    reach,
  }: GetRewardsEligibleType): Promise<RewardsByObjectType> {
    const user = await this.userRepository.findOne({
      filter: { name: userName },
      projection: { count_posts: 1, followers_count: 1, wobjects_weight: 1 },
    });
    if (!user) return { rewards: [], hasMore: false };
    const rewards: RewardsByRequiredType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              status: CAMPAIGN_STATUS.ACTIVE,
              ...(requiredObject && { requiredObject }),
              ...(sponsors && { guideName: { $in: sponsors } }),
              ...(type && { type: { $in: type } }),
              ...(reach && { reach }),
            },
          },
          ...(await this.getEligiblePipe({ userName, user })),
          { $sort: { rewardInUsd: -1 } },
          { $unwind: { path: '$objects' } },
          {
            $lookup: {
              from: COLLECTION.WOBJECTS,
              localField: 'objects',
              foreignField: 'author_permlink',
              as: 'object',
            },
          },
          {
            $project: {
              object: { $arrayElemAt: ['$object', 0] },
              frequencyAssign: 1,
              matchBots: 1,
              agreementObjects: 1,
              usersLegalNotice: 1,
              description: 1,
              payoutToken: 1,
              currency: 1,
              reward: 1,
              rewardInUSD: 1,
              guideName: 1,
              requirements: 1,
              userRequirements: 1,
              countReservationDays: 1,
              activationPermlink: 1,
            },
          },
          {
            $match: {
              'object.status.title': {
                $nin: [WOBJECT_STATUS.UNAVAILABLE, WOBJECT_STATUS.RELISTED],
              },
            },
          },
          { $skip: skip },
          { $limit: limit + 1 },
        ],
      });

    const rewardsWithAdditionalData = await this.addDataOnRewardsByObject({
      rewards,
      host,
    });

    return {
      rewards: _.take(rewardsWithAdditionalData, limit),
      hasMore: rewardsWithAdditionalData.length > limit,
    };
  }

  async getRewardsMain({
    skip,
    limit,
    host,
    sponsors,
    type,
    sort,
    area,
    requiredObjects,
    radius,
    reach,
  }: GetRewardsMainType): Promise<RewardsAllType> {
    const campaigns = await this.campaignRepository.find({
      filter: {
        status: CAMPAIGN_STATUS.ACTIVE,
        ...(sponsors && { guideName: { $in: sponsors } }),
        ...(type && { type: { $in: type } }),
        ...(requiredObjects && { requiredObject: { $in: requiredObjects } }),
        ...(reach && { reach }),
      },
    });

    return this.getPrimaryObjectRewards({
      skip,
      limit,
      host,
      sort,
      area,
      campaigns,
      radius,
    });
  }

  async getPrimaryObjectRewards({
    skip,
    limit,
    host,
    sort,
    area,
    campaigns,
    radius,
  }: GetPrimaryObjectRewards): Promise<RewardsAllType> {
    const rewards = [];
    const objects = await this.wobjectHelper.getWobjectsForCampaigns({
      links: _.uniq(_.map(campaigns, 'requiredObject')),
      host,
    });

    const groupedCampaigns = _.groupBy(campaigns, 'requiredObject');
    for (const key in groupedCampaigns) {
      const object = objects.find((o) => o.author_permlink === key);
      if (!object) continue;
      if (
        _.includes(
          [WOBJECT_STATUS.RELISTED, WOBJECT_STATUS.UNAVAILABLE],
          _.get(object, 'status.title'),
        )
      ) {
        continue;
      }
      const payout = this.rewardsHelper.getPayedForMain(groupedCampaigns[key]);
      const coordinates =
        _.compact(this.rewardsHelper.parseCoordinates(object?.map)) || [];

      const distance =
        area && coordinates.length === 2
          ? this.rewardsHelper.getDistance(area, coordinates)
          : null;
      if (radius) {
        if (distance > radius) continue;
      }
      rewards.push({
        lastCreated: _.maxBy(
          groupedCampaigns[key],
          (campaign) => campaign.createdAt,
        ).createdAt,
        minReward: _.minBy(
          groupedCampaigns[key],
          (campaign) => campaign.rewardInUSD,
        ).rewardInUSD,
        maxReward: _.maxBy(
          groupedCampaigns[key],
          (campaign) => campaign.rewardInUSD,
        ).rewardInUSD,
        distance,
        object,
        payout,
        reach: _.uniq(_.map(campaigns, 'reach')),
      });
    }

    const sorted = this.getSortedCampaignMain({ sort, rewards });

    return {
      rewards: sorted.slice(skip, skip + limit),
      hasMore: sorted.slice(skip).length > limit,
    };
  }

  async getRewardsByRequiredObject({
    requiredObject,
    skip,
    limit,
    host,
    sponsors,
    type,
    sort,
    userName,
    reach,
  }: GetRewardsByRequiredObjectType): Promise<RewardsByObjectType> {
    const rewards: RewardsByRequiredType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              requiredObject,
              status: CAMPAIGN_STATUS.ACTIVE,
              ...(sponsors && { guideName: { $in: sponsors } }),
              ...(type && { type: { $in: type } }),
              ...(reach && { reach }),
            },
          },
          { $sort: { rewardInUsd: -1 } },
          { $unwind: { path: '$objects' } },
          {
            $lookup: {
              from: COLLECTION.WOBJECTS,
              localField: 'objects',
              foreignField: 'author_permlink',
              as: 'object',
            },
          },
          {
            $addFields: {
              assignedUser: {
                $filter: {
                  input: '$users',
                  as: 'user',
                  cond: {
                    $and: [
                      { $eq: ['$$user.status', RESERVATION_STATUS.ASSIGNED] },
                      { $eq: ['$$user.name', userName] },
                      {
                        $eq: ['$$user.objectPermlink', '$objects'],
                      },
                    ],
                  },
                },
              },
            },
          },
          {
            $project: {
              object: { $arrayElemAt: ['$object', 0] },
              reserved: { $gt: ['$assignedUser', []] },
              reservationCreatedAt: {
                $let: {
                  vars: {
                    firstMember: {
                      $arrayElemAt: ['$assignedUser', 0],
                    },
                  },
                  in: '$$firstMember.createdAt',
                },
              },
              reservationPermlink: {
                $let: {
                  vars: {
                    firstMember: {
                      $arrayElemAt: ['$assignedUser', 0],
                    },
                  },
                  in: '$$firstMember.reservationPermlink',
                },
              },
              commentsCount: {
                $let: {
                  vars: {
                    firstMember: {
                      $arrayElemAt: ['$assignedUser', 0],
                    },
                  },
                  in: '$$firstMember.commentsCount',
                },
              },
              payoutTokenRateUSD: {
                $let: {
                  vars: {
                    firstMember: {
                      $arrayElemAt: ['$assignedUser', 0],
                    },
                  },
                  in: '$$firstMember.payoutTokenRateUSD',
                },
              },
              rootName: {
                $let: {
                  vars: {
                    firstMember: {
                      $arrayElemAt: ['$assignedUser', 0],
                    },
                  },
                  in: '$$firstMember.rootName',
                },
              },
              frequencyAssign: 1,
              matchBots: 1,
              agreementObjects: 1,
              usersLegalNotice: 1,
              description: 1,
              payoutToken: 1,
              currency: 1,
              reward: 1,
              objects: 1,
              rewardInUSD: 1,
              guideName: 1,
              requirements: 1,
              userRequirements: 1,
              countReservationDays: 1,
              activationPermlink: 1,
            },
          },
          {
            $match: {
              'object.status.title': {
                $nin: [WOBJECT_STATUS.UNAVAILABLE, WOBJECT_STATUS.RELISTED],
              },
            },
          },
          { $skip: skip },
          { $limit: limit + 1 },
        ],
      });

    const rewardsWithAdditionalData = await this.addDataOnRewardsByObject({
      rewards,
      host,
    });

    return {
      rewards: _.take(rewardsWithAdditionalData, limit),
      hasMore: rewardsWithAdditionalData.length > limit,
    };
  }

  async addDataOnRewardsByObject({
    rewards,
    host,
  }: AddDataOnRewardsByObjectType): Promise<RewardsByRequiredType[]> {
    const app = await this.appRepository.findOneByHost(host);
    const payed = await this.guidePaymentsQuery.getGuidesTotalPayed({
      guideNames: _.map(rewards, 'guideName'),
      payoutToken: TOKEN_WAIV.SYMBOL,
    });
    for (const reward of rewards) {
      const guidePayed = payed.find((el) => el.guideName === reward.guideName);
      reward.totalPayed = guidePayed?.payed || 0;
      if (!reward.object) continue;
      reward.object = await this.wobjectHelper.processWobjects({
        wobjects: reward.object,
        fields: CAMPAIGN_FIELDS,
        app,
        returnArray: false,
      });
    }
    return rewards;
  }

  async getSponsorsAll({
    requiredObject,
    reach,
  }: GetSponsorsAllInterface): Promise<GetSponsorsType> {
    const sponsors: GetSponsorsType[] = await this.campaignRepository.aggregate(
      {
        pipeline: [
          {
            $match: {
              status: CAMPAIGN_STATUS.ACTIVE,
              ...(requiredObject && { requiredObject }),
              ...(reach && { reach }),
            },
          },
          {
            $group: {
              _id: '$status',
              type: { $addToSet: '$type' },
              sponsors: { $addToSet: '$guideName' },
              reach: { $addToSet: '$reach' },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ],
      },
    );
    if (_.isEmpty(sponsors)) return { type: [], sponsors: [], reach: [] };
    return sponsors[0];
  }

  async getSponsorsEligible({
    userName,
    requiredObject,
    reach,
  }: GetSponsorsEligibleInterface): Promise<GetSponsorsType> {
    const user = await this.userRepository.findOne({
      filter: { name: userName },
      projection: { count_posts: 1, followers_count: 1, wobjects_weight: 1 },
    });
    if (!user) return { type: [], sponsors: [], reach: [] };
    const sponsors: GetSponsorsType[] = await this.campaignRepository.aggregate(
      {
        pipeline: [
          {
            $match: {
              status: CAMPAIGN_STATUS.ACTIVE,
              ...(requiredObject && { requiredObject }),
              ...(reach && { reach }),
            },
          },
          ...(await this.getEligiblePipe({ userName, user })),
          {
            $group: {
              _id: '$status',
              type: { $addToSet: '$type' },
              sponsors: { $addToSet: '$guideName' },
              reach: { $addToSet: '$reach' },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ],
      },
    );
    if (_.isEmpty(sponsors)) return { type: [], sponsors: [], reach: [] };
    return sponsors[0];
  }

  async getExpertiseVariables(): Promise<ExpertiseVariablesType> {
    const rewardFund = await this.redisBlockClient.hGetAll(
      REDIS_KEY.REWARD_FUND,
    );
    const median = await this.redisBlockClient.hGetAll(
      REDIS_KEY.MEDIAN_HISTORY,
    );
    const recentClaims = parseFloat(_.get(rewardFund, 'recent_claims', '0'));
    const rewardBalance = parseFloat(_.get(rewardFund, 'reward_balance', '0'));

    const rate =
      parseFloat(_.get(median, 'base', '0')) /
      parseFloat(_.get(median, 'quote', '0'));

    return {
      rewardBalanceTimesRate: rewardBalance * rate,
      claims: recentClaims / 1000000,
    };
  }

  async getEligiblePipe({
    userName,
    user,
  }: GetEligiblePipeType): Promise<PipelineStage[]> {
    const currentDay = moment().format('dddd').toLowerCase();
    const assignedObjects = await this.findAssignedMainObjects(userName);

    const { rewardBalanceTimesRate, claims } =
      await this.getExpertiseVariables();

    return [
      { $match: { guideName: { $ne: userName } } },
      {
        $addFields: {
          requiredExpertise: {
            $divide: [
              {
                $multiply: ['$userRequirements.minExpertise', claims],
              },
              rewardBalanceTimesRate,
            ],
          },
          blacklist: {
            $setDifference: ['$blacklistUsers', '$whitelistUsers'],
          },
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
          thisMonthCompleted: {
            $filter: {
              input: '$users',
              as: 'user',
              cond: {
                $and: [
                  { $eq: ['$$user.status', 'completed'] },
                  {
                    $gte: [
                      '$$user.updatedAt',
                      moment.utc().startOf('month').toDate(),
                    ],
                  },
                ],
              },
            },
          },
          assigned: {
            $filter: {
              input: '$users',
              as: 'user',
              cond: { $eq: ['$$user.status', 'assigned'] },
            },
          },
        },
      },
      {
        $addFields: {
          thisMonthCompleted: { $size: '$thisMonthCompleted' },
          assigned: { $size: '$assigned' },
          completedUser: {
            $arrayElemAt: [
              '$completedUser',
              {
                $indexOfArray: [
                  '$completedUser.updatedAt',
                  { $max: '$array.updatedAt' },
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          monthBudget: {
            $multiply: [
              '$reward',
              { $sum: ['$thisMonthCompleted', '$assigned'] },
            ],
          },
          daysPassed: {
            $dateDiff: {
              startDate: '$completedUser.updatedAt',
              endDate: moment.utc().toDate(),
              unit: 'day',
            },
          },
        },
      },
      {
        $addFields: {
          canAssignByBudget: { $gt: ['$budget', '$monthBudget'] },
          canAssignByCurrentDay: {
            $eq: [`$reservationTimetable.${currentDay}`, true],
          },
          posts: { $gte: [user.count_posts, '$userRequirements.minPosts'] },
          followers: {
            $gte: [user.followers_count, '$userRequirements.minFollowers'],
          },
          expertise: {
            $gte: [user.wobjects_weight, '$requiredExpertise'],
          },
          notAssigned: {
            $cond: [{ $in: ['$requiredObject', assignedObjects] }, false, true],
          },
          frequency: {
            $or: [
              { $gte: ['$daysPassed', '$frequencyAssign'] },
              { $eq: ['$daysPassed', null] },
            ],
          },
        },
      },
      {
        $match: {
          canAssignByBudget: true,
          canAssignByCurrentDay: true,
          posts: true,
          followers: true,
          expertise: true,
          notAssigned: true,
          frequency: true,
          blacklist: { $ne: userName },
        },
      },
    ];
  }

  getSortedCampaignMain({
    sort,
    rewards,
  }: GetSortedCampaignMainType): RewardsMainType[] {
    switch (sort) {
      case CAMPAIGN_SORTS.DATE:
        return _.orderBy(rewards, ['lastCreated'], ['desc']);
      case CAMPAIGN_SORTS.PROXIMITY:
        return _.sortBy(rewards, (campaign) => campaign.distance);
      case CAMPAIGN_SORTS.REWARD:
        return _.orderBy(rewards, ['maxReward', 'lastCreated'], ['desc']);
      case CAMPAIGN_SORTS.PAYOUT:
        return _.orderBy(rewards, ['payout'], ['desc']);
      case CAMPAIGN_SORTS.DEFAULT:
      default:
        return _.orderBy(rewards, ['payout'], ['desc']);
    }
  }
}
