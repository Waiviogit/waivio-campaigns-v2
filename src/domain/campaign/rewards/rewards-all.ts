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
  REWARDS_PROVIDE,
  WOBJECT_STATUS,
  WOBJECT_SUBSCRIPTION_PROVIDE,
  USER_SUBSCRIPTION_PROVIDE,
  MUTED_USER_PROVIDE,
  CAMPAIGN_TYPE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  CanReserveParamType,
  CanReserveType,
  GetEligiblePipeType,
  GetJudgeRewardsMainType,
  GetPrimaryObjectRewards,
  GetReservedType,
  GetRewardsByRequiredObjectType,
  GetRewardsEligibleType,
  GetRewardsJudgeType,
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
  GetSponsorsJudgeInterface,
  RewardsAllInterface,
  RewardsHelperInterface,
} from './interface';
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import { configService } from '../../../common/config';
import { GuidePaymentsQueryInterface } from '../../campaign-payment/interface';
import { AddDataOnRewardsByObjectType } from '../../campaign-payment/types';
import { PipelineStage } from 'mongoose';
import { WobjectSubscriptionsRepositoryInterface } from '../../../persistance/wobject-subscriptions/interface';
import { UserSubscriptionRepositoryInterface } from '../../../persistance/user-subscriptions/interface';
import { MutedUserRepositoryInterface } from '../../../persistance/muted-user/interface';

type AggregatedByObjectResult = {
  objects: string;
  lastCreated: Date;
  payout: number;
  minReward: number;
  maxReward: number;
  guideName: string;
  reach: string[];
};

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
    @Inject(REWARDS_PROVIDE.HELPER)
    private readonly rewardsHelper: RewardsHelperInterface,
    @Inject(WOBJECT_SUBSCRIPTION_PROVIDE.REPOSITORY)
    private readonly wobjectSubscriptionsRepository: WobjectSubscriptionsRepositoryInterface,
    @Inject(USER_SUBSCRIPTION_PROVIDE.REPOSITORY)
    private readonly userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @Inject(MUTED_USER_PROVIDE.REPOSITORY)
    private readonly mutedUserRepository: MutedUserRepositoryInterface,
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
      type: '',
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
            type: 1,
            canAssignByBudget: 1,
            canAssignByCurrentDay: 1,
            posts: 1,
            followers: 1,
            expertise: 1,
            notAssigned: 1,
            frequency: 1,
            notBlacklisted: { $not: { $in: [userName, '$blacklist'] } },
          },
        },
      ],
    });
    if (!reserve || !reserve.length) return errResponse;
    if (
      ![CAMPAIGN_TYPE.REVIEWS, CAMPAIGN_TYPE.MENTIONS].includes(
        reserve[0].type as 'reviews' | 'mentions',
      )
    ) {
      reserve[0].canAssignByBudget = true;
    }

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

  private buildGroupedByObjectsPipeline({
    preMatch,
    postUnwindMatch,
    preStages = [],
    sort,
    skip,
    limit,
    area,
    radius,
  }: {
    preMatch: Record<string, unknown>;
    postUnwindMatch?: Record<string, unknown>;
    preStages?: PipelineStage[];
    sort?: string;
    skip?: number;
    limit?: number;
    area?: number[];
    radius?: number;
  }): PipelineStage[] {
    const pipeline: PipelineStage[] = [];
    if (preMatch && Object.keys(preMatch).length)
      pipeline.push({ $match: preMatch });
    if (preStages?.length) pipeline.push(...preStages);
    pipeline.push({ $unwind: { path: '$objects' } });
    if (postUnwindMatch && Object.keys(postUnwindMatch).length)
      pipeline.push({ $match: postUnwindMatch });

    pipeline.push({
      $addFields: {
        completedUsers: {
          $filter: {
            input: '$users',
            as: 'u',
            cond: { $eq: ['$$u.status', RESERVATION_STATUS.COMPLETED] },
          },
        },
        maxCandidate: {
          $cond: [
            { $eq: ['$type', CAMPAIGN_TYPE.CONTESTS_OBJECT] },
            { $max: '$contestRewards.rewardInUSD' },
            '$rewardInUSD',
          ],
        },
        minCandidate: {
          $cond: [
            { $eq: ['$type', CAMPAIGN_TYPE.CONTESTS_OBJECT] },
            { $min: '$contestRewards.rewardInUSD' },
            '$rewardInUSD',
          ],
        },
      },
    });
    pipeline.push({
      $addFields: { completedCount: { $size: '$completedUsers' } },
    });
    pipeline.push({
      $addFields: {
        payoutUnit: {
          $multiply: [
            {
              $cond: [{ $gt: ['$completedCount', 0] }, '$completedCount', 1],
            },
            '$rewardInUSD',
            '$commissionAgreement',
          ],
        },
      },
    });
    pipeline.push({ $sort: { maxCandidate: -1 } });
    pipeline.push({
      $group: {
        _id: '$objects',
        lastCreated: { $max: '$createdAt' },
        payout: { $sum: '$payoutUnit' },
        minReward: { $min: '$minCandidate' },
        maxReward: { $max: '$maxCandidate' },
        guideName: { $first: '$guideName' },
        reach: { $addToSet: '$reach' },
      },
    });
    pipeline.push({
      $project: {
        _id: 0,
        objects: '$_id',
        lastCreated: 1,
        payout: 1,
        minReward: 1,
        maxReward: 1,
        guideName: 1,
        reach: 1,
      },
    });

    // Proximity sorting branch: lookup wobject and compute distance, then sort/limit
    if (
      sort === CAMPAIGN_SORTS.PROXIMITY &&
      Array.isArray(area) &&
      area.length === 2
    ) {
      /* eslint-disable */
      const distanceFn = "function (map, area) {\n                try {\n                  if (!map) return null;\n                  var coords = JSON.parse(map);\n                  var lon = coords.longitude, lat = coords.latitude;\n                  if (typeof lon !== 'number' || typeof lat !== 'number') return null;\n                  var EARTH_RADIUS = 6372795;\n                  var long1 = area[0] * (Math.PI / 180);\n                  var long2 = lat * (Math.PI / 180);\n                  var lat1 = area[1] * (Math.PI / 180);\n                  var lat2 = lon * (Math.PI / 180);\n                  var cl1 = Math.cos(lat1);\n                  var cl2 = Math.cos(lat2);\n                  var sl1 = Math.sin(lat1);\n                  var sl2 = Math.sin(lat2);\n                  var delta = long2 - long1;\n                  var cdelta = Math.cos(delta);\n                  var sdelta = Math.sin(delta);\n                  var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));\n                  var x = sl1 * sl2 + cl1 * cl2 * cdelta;\n                  var ad = Math.atan2(y, x);\n                  return Math.round(ad * EARTH_RADIUS);\n                } catch (e) {\n                  return null;\n                }\n              }";
      pipeline.push({
        $lookup: {
          from: COLLECTION.WOBJECTS,
          localField: 'objects',
          foreignField: 'author_permlink',
          as: 'object',
        },
      });
      pipeline.push({
        $addFields: { object: { $arrayElemAt: ['$object', 0] } },
      });
      pipeline.push({
        $addFields: {
          distance: {
            $function: {
              body: distanceFn,
              args: ['$object.map', area],
              lang: 'js',
            },
          },
        },
      });
      if (typeof radius === 'number' && radius > 0) {
        pipeline.push({ $match: { distance: { $ne: null, $lte: radius } } });
      }
      pipeline.push({ $sort: { distance: 1 } });
      if (typeof skip === 'number' && skip > 0) pipeline.push({ $skip: skip });
      if (typeof limit === 'number' && limit > 0)
        pipeline.push({ $limit: (limit as number) + 1 });
      /* eslint-enable */
      return pipeline;
    }

    // Default and payout/date branches: sort then limit
    if (
      !sort ||
      sort === CAMPAIGN_SORTS.DEFAULT ||
      sort === CAMPAIGN_SORTS.PAYOUT
    ) {
      pipeline.push({ $sort: { payout: -1 } });
    } else if (sort === CAMPAIGN_SORTS.DATE) {
      pipeline.push({ $sort: { lastCreated: -1 } });
    }
    if (typeof skip === 'number' && skip > 0) pipeline.push({ $skip: skip });
    if (typeof limit === 'number' && limit > 0)
      pipeline.push({ $limit: (limit as number) + 1 });

    return pipeline;
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
    const pipeline = this.buildGroupedByObjectsPipeline({
      preMatch: {
        status: CAMPAIGN_STATUS.ACTIVE,
        ...(sponsors && { guideName: { $in: sponsors } }),
        ...(type && { type: { $in: type } }),
        ...(activationPermlink && { activationPermlink }),
        ...(reach && { reach }),
      },
      preStages: await this.getEligiblePipe({ userName, user }),
      sort,
      skip,
      limit,
      area,
      radius,
    });

    const campaigns = (await this.campaignRepository.aggregate({
      pipeline,
    })) as unknown as AggregatedByObjectResult[];

    return this.getPrimaryObjectRewards({
      skip,
      limit,
      host,
      sort,
      area,
      campaigns: campaigns as unknown as unknown[],
      radius,
      userName,
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

    const preMatch: Record<string, unknown> = {
      status: CAMPAIGN_STATUS.ACTIVE,
      ...(usersList.length ? { guideName: { $in: usersList } } : {}),
    };
    const postUnwindMatch: Record<string, unknown> | undefined =
      objectsList.length ? { objects: { $in: objectsList } } : undefined;

    const pipeline = this.buildGroupedByObjectsPipeline({
      preMatch,
      postUnwindMatch,
      preStages: await this.getEligiblePipe({ userName, user }),
      sort,
      skip,
      limit,
      area,
      radius,
    });

    const campaigns = (await this.campaignRepository.aggregate({
      pipeline,
    })) as unknown as AggregatedByObjectResult[];

    return this.getPrimaryObjectRewards({
      skip,
      limit,
      host,
      sort,
      area,
      campaigns: campaigns as unknown as unknown[],
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
              ...(requiredObject && { objects: requiredObject }),
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
              ...this.commonObjectProjection(),
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
      userName,
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
    userName,
  }: GetRewardsMainType): Promise<RewardsAllType> {
    const mutedList = await this.mutedUserRepository.find({
      filter: { mutedBy: userName },
    });
    const mutedNames = mutedList.map((el) => el.userName);
    const guideCondition = mutedList?.length || sponsors?.length;

    // Build aggregation to unwind objects and group by objects with calculated metrics
    const pipeline: PipelineStage[] = [];
    const matchStage: Record<string, unknown> = {
      status: CAMPAIGN_STATUS.ACTIVE,
      ...(guideCondition && {
        guideName: {
          ...(mutedNames?.length ? { $nin: mutedNames } : {}),
          ...(sponsors ? { $in: sponsors } : {}),
        },
      }),
      ...(sponsors && { guideName: { $in: sponsors } }),
      ...(type && { type: { $in: type } }),
      // requiredObjects now filters on objects field (applied after unwind)
      ...(reach && { reach }),
    };

    pipeline.push({ $match: matchStage });
    pipeline.push({ $unwind: { path: '$objects' } });
    if (requiredObjects && requiredObjects.length) {
      pipeline.push({ $match: { objects: { $in: requiredObjects } } });
    }

    // Pre-compute candidates per campaign document
    pipeline.push({
      $addFields: {
        completedUsers: {
          $filter: {
            input: '$users',
            as: 'u',
            cond: { $eq: ['$$u.status', RESERVATION_STATUS.COMPLETED] },
          },
        },
        maxCandidate: {
          $cond: [
            { $eq: ['$type', CAMPAIGN_TYPE.CONTESTS_OBJECT] },
            { $max: '$contestRewards.rewardInUSD' },
            '$rewardInUSD',
          ],
        },
        minCandidate: {
          $cond: [
            { $eq: ['$type', CAMPAIGN_TYPE.CONTESTS_OBJECT] },
            { $min: '$contestRewards.rewardInUSD' },
            '$rewardInUSD',
          ],
        },
      },
    });
    pipeline.push({
      $addFields: {
        completedCount: { $size: '$completedUsers' },
      },
    });
    pipeline.push({
      $addFields: {
        payoutUnit: {
          $multiply: [
            { $cond: [{ $gt: ['$completedCount', 0] }, '$completedCount', 1] },
            '$rewardInUSD',
            '$commissionAgreement',
          ],
        },
      },
    });

    // Sort by maxCandidate so that $first in group picks guide of highest reward campaign per object
    pipeline.push({ $sort: { maxCandidate: -1 } });

    pipeline.push({
      $group: {
        _id: '$objects',
        lastCreated: { $max: '$createdAt' },
        payout: { $sum: '$payoutUnit' },
        minReward: { $min: '$minCandidate' },
        maxReward: { $max: '$maxCandidate' },
        guideName: { $first: '$guideName' },
        reach: { $addToSet: '$reach' },
      },
    });

    pipeline.push({
      $project: {
        _id: 0,
        objects: '$_id',
        lastCreated: 1,
        payout: 1,
        minReward: 1,
        maxReward: 1,
        guideName: 1,
        reach: 1,
      },
    });

    // Default sort by payout desc to support skip/limit inside aggregation
    if (
      !sort ||
      sort === CAMPAIGN_SORTS.DEFAULT ||
      sort === CAMPAIGN_SORTS.PAYOUT
    ) {
      pipeline.push({ $sort: { payout: -1 } });
    } else if (sort === CAMPAIGN_SORTS.DATE) {
      pipeline.push({ $sort: { lastCreated: -1 } });
    }

    if (typeof skip === 'number' && skip > 0) pipeline.push({ $skip: skip });
    if (typeof limit === 'number' && limit > 0)
      pipeline.push({ $limit: (limit as number) + 1 });

    const campaigns = (await this.campaignRepository.aggregate({
      pipeline,
    })) as unknown as AggregatedByObjectResult[];

    return this.getPrimaryObjectRewards({
      skip,
      limit,
      host,
      sort,
      area,
      campaigns: campaigns as unknown as unknown[],
      radius,
      userName,
    });
  }

  async getJudgeRewardsMain({
    skip,
    limit,
    host,
    sort,
    judgeName,
    sponsors,
    type,
    reach,
  }: GetJudgeRewardsMainType): Promise<RewardsAllType> {
    const pipeline = this.buildGroupedByObjectsPipeline({
      preMatch: {
        status: CAMPAIGN_STATUS.ACTIVE,
        contestJudges: judgeName,
        ...(sponsors && { guideName: { $in: sponsors } }),
        ...(type && { type: { $in: type } }),
        ...(reach && { reach }),
      },
      sort,
      skip,
      limit,
      area: undefined,
      radius: undefined,
    });

    const campaigns = (await this.campaignRepository.aggregate({
      pipeline,
    })) as unknown as AggregatedByObjectResult[];

    return this.getPrimaryObjectRewards({
      skip,
      limit,
      host,
      sort,
      campaigns: campaigns as unknown as unknown[],
      userName: judgeName,
    });
  }

  private commonObjectProjection(): Record<string, unknown> {
    return {
      object: { $arrayElemAt: ['$object', 0] },
      objects: 1,
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
      type: 1,
      qualifiedPayoutToken: 1,
      giveawayPermlink: 1,
      giveawayPostTitle: 1,
      contestRewards: 1,
      contestJudges: 1,
      budget: 1,
    };
  }

  async getSponsorsJudge({
    requiredObject,
    reach,
    judgeName,
  }: GetSponsorsJudgeInterface): Promise<GetSponsorsType> {
    const sponsors: GetSponsorsType[] = await this.campaignRepository.aggregate(
      {
        pipeline: [
          {
            $match: {
              status: CAMPAIGN_STATUS.ACTIVE,
              contestJudges: judgeName,
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

  async getJudgeRewardsByObject({
    skip,
    limit,
    host,
    sponsors,
    type,
    userName,
    requiredObject,
    reach,
    judgeName,
  }: GetRewardsJudgeType): Promise<RewardsByObjectType> {
    const rewards: RewardsByRequiredType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              status: CAMPAIGN_STATUS.ACTIVE,
              contestJudges: judgeName,
              ...(requiredObject && { objects: requiredObject }),
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
            $project: {
              ...this.commonObjectProjection(),
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
      userName: judgeName,
    });

    return {
      rewards: _.take(rewardsWithAdditionalData, limit),
      hasMore: rewardsWithAdditionalData.length > limit,
    };
  }

  private getMinMaxRewardForPrimary(groupedCampaigns): {
    minReward: number;
    maxReward: number;
    guideName: string;
  } {
    let minReward: number;
    let maxReward: number;

    const maxRewardCampaign = _.maxBy(groupedCampaigns, (campaign) => {
      if (campaign.type === CAMPAIGN_TYPE.CONTESTS_OBJECT) {
        return _.maxBy(campaign.contestRewards, 'rewardInUSD').rewardInUSD;
      }
      return campaign.rewardInUSD;
    });
    if (maxRewardCampaign.type === CAMPAIGN_TYPE.CONTESTS_OBJECT) {
      maxReward =
        _.maxBy(maxRewardCampaign.contestRewards, 'rewardInUSD')?.rewardInUSD ||
        0;
    } else {
      maxReward = maxRewardCampaign?.rewardInUSD || 0;
    }

    const guideName = maxRewardCampaign.guideName || '';

    const minRewardCampaign = _.minBy(groupedCampaigns, (campaign) => {
      if (campaign.type === CAMPAIGN_TYPE.CONTESTS_OBJECT) {
        return _.minBy(campaign.contestRewards, 'rewardInUSD').rewardInUSD;
      }
      return campaign.rewardInUSD;
    });

    if (minRewardCampaign.type === CAMPAIGN_TYPE.CONTESTS_OBJECT) {
      minReward =
        _.minBy(maxRewardCampaign.contestRewards, 'rewardInUSD')?.rewardInUSD ||
        0;
    } else {
      minReward = maxRewardCampaign?.rewardInUSD || 0;
    }

    return {
      minReward,
      maxReward,
      guideName,
    };
  }

  async getPrimaryObjectRewards({
    skip: _skip,
    limit,
    host,
    sort,
    area,
    campaigns,
    radius,
    userName,
  }: GetPrimaryObjectRewards): Promise<RewardsAllType> {
    const rewards = [];

    // Input campaigns are aggregated by objects (from aggregation pipeline)
    {
      const objectsLinks = _.compact(
        _.uniq(_.map(campaigns as AggregatedByObjectResult[], 'objects')),
      );

      const objects = await this.wobjectHelper.getWobjectsForCampaigns({
        links: this.rewardsHelper.filterObjectLinks(objectsLinks),
        host,
        userName,
      });

      const campaignUsers = await this.userRepository.findCampaignsUsers(
        this.rewardsHelper.getCampaignUsersFromArray(objectsLinks),
      );

      for (const item of campaigns as AggregatedByObjectResult[]) {
        const key = item.objects as string;
        const object = objects.find((o) => o.author_permlink === key);
        const user = campaignUsers.find(
          (u) => u.name === this.rewardsHelper.extractUsername(key),
        );
        const webLink = !object && !user && key.includes('https://') && key;

        if (!object && !user && !webLink) continue;
        if (
          _.includes(
            [WOBJECT_STATUS.RELISTED, WOBJECT_STATUS.UNAVAILABLE],
            _.get(object, 'status.title'),
          )
        ) {
          continue;
        }

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
          lastCreated: item.lastCreated,
          minReward: item.minReward,
          maxReward: item.maxReward,
          guideName: item.guideName,
          distance,
          object,
          user,
          webLink,
          payout: item.payout,
          reach: item.reach ?? [],
        });
      }

      // Skip/limit already applied inside pipeline; only additional sort types might adjust order
      const sorted = this.getSortedCampaignMain({ sort, rewards });
      return {
        rewards: sorted,
        hasMore:
          (campaigns as AggregatedByObjectResult[]).length > (limit ?? 0),
      };
    }
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
              ...this.commonObjectProjection(),
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
      userName,
    });

    return {
      rewards: _.take(rewardsWithAdditionalData, limit),
      hasMore: rewardsWithAdditionalData.length > limit,
    };
  }

  async addDataOnRewardsByObject({
    rewards,
    host,
    userName,
  }: AddDataOnRewardsByObjectType): Promise<RewardsByRequiredType[]> {
    const app = await this.appRepository.findOneByHost(host);
    const payed = await this.guidePaymentsQuery.getGuidesTotalPayed({
      guideNames: _.map(rewards, 'guideName'),
      payoutToken: TOKEN_WAIV.SYMBOL,
    });

    const campaignUsers = await this.userRepository.findCampaignsUsers(
      this.rewardsHelper.getCampaignUsersFromArray(
        _.compact(rewards.map((el) => el.objects)),
      ),
    );

    for (const reward of rewards) {
      const guidePayed = payed.find((el) => el.guideName === reward.guideName);
      reward.totalPayed = guidePayed?.payed || 0;

      const user = campaignUsers.find(
        (u) => u.name === this.rewardsHelper.extractUsername(reward.objects),
      );
      const webLink =
        !reward.object &&
        !user &&
        reward.objects.includes('https://') &&
        reward.objects;

      if (reward.object) {
        reward.object = await this.wobjectHelper.processWobjects({
          wobjects: reward.object,
          fields: CAMPAIGN_FIELDS,
          app,
          returnArray: false,
          reqUserName: userName,
        });
      }
      if (user) reward.user = user;
      if (webLink) reward.webLink = webLink;
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

  async getEligiblePipe({
    userName,
    user,
  }: GetEligiblePipeType): Promise<PipelineStage[]> {
    const currentDay = moment().format('dddd').toLowerCase();
    const assignedObjects = await this.findAssignedMainObjects(userName);

    const mutedList = await this.mutedUserRepository.find({
      filter: { mutedBy: userName },
    });

    const mutedNames = mutedList.map((el) => el.userName);

    return [
      {
        $addFields: {
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
          posts: {
            $gte: [user?.count_posts ?? 0, '$userRequirements.minPosts'],
          },
          followers: {
            $gte: [
              user?.followers_count ?? 0,
              '$userRequirements.minFollowers',
            ],
          },
          expertise: {
            $gte: [
              user?.wobjects_weight ?? 0,
              '$userRequirements.minExpertise',
            ],
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
          ...(mutedNames.length && { guideName: { $nin: mutedNames } }),
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
