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
import {
  getNextClosestDate,
  getNextEventDate,
} from '../../../common/helpers/rruleHelper';

export const SECONDARY_PROJECTION = Object.freeze({
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
  recurrenceRule: 1,
  sponsorName: 1,
  sponsorURL: 1,
  objects: 1,
} as const);

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
              objects: 1,
              ...SECONDARY_PROJECTION,
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

    const campaigns = await this.campaignRepository.find({
      filter: {
        status: CAMPAIGN_STATUS.ACTIVE,
        ...(guideCondition && {
          guideName: {
            ...(mutedNames?.length ? { $nin: mutedNames } : {}),
            ...(sponsors ? { $in: sponsors } : {}),
          },
        }),
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
    const campaigns = await this.campaignRepository.find({
      filter: {
        status: CAMPAIGN_STATUS.ACTIVE,
        contestJudges: judgeName,
        ...(sponsors && { guideName: { $in: sponsors } }),
        ...(type && { type: { $in: type } }),
        ...(reach && { reach }),
      },
    });

    return this.getPrimaryObjectRewards({
      skip,
      limit,
      host,
      sort,
      campaigns,
      userName: judgeName,
    });
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
              ...(requiredObject && { requiredObject }),
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
              object: { $arrayElemAt: ['$object', 0] },
              objects: 1,
              ...SECONDARY_PROJECTION,
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
    skip,
    limit,
    host,
    sort,
    area,
    campaigns,
    radius,
    userName,
  }: GetPrimaryObjectRewards): Promise<RewardsAllType> {
    const rewards = [];
    const requiredObjects = _.compact(
      _.uniq(_.map(campaigns, 'requiredObject')),
    );

    const objects = await this.wobjectHelper.getWobjectsForCampaigns({
      links: this.rewardsHelper.filterObjectLinks(requiredObjects),
      host,
      userName,
    });

    const campaignUsers = await this.userRepository.findCampaignsUsers(
      this.rewardsHelper.getCampaignUsersFromArray(requiredObjects),
    );

    const groupedCampaigns = _.groupBy(campaigns, 'requiredObject');
    for (const key in groupedCampaigns) {
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

      const nextEventDate = getNextClosestDate(
        groupedCampaigns[key]
          .map((el) => el.recurrenceRule)
          .filter((el) => !!el),
      );

      const { minReward, maxReward, guideName } =
        this.getMinMaxRewardForPrimary(groupedCampaigns[key]);

      rewards.push({
        lastCreated: _.maxBy(
          groupedCampaigns[key],
          (campaign) => campaign.createdAt,
        ).createdAt,
        minReward,
        maxReward,
        guideName,
        distance,
        object,
        user,
        webLink,
        payout,
        reach: _.uniq(_.map(campaigns, 'reach')),
        nextEventDate,
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
              ...SECONDARY_PROJECTION,
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
      reward.nextEventDate = getNextEventDate(reward.recurrenceRule);
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
