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
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  CanReserveParamType,
  CanReserveType,
  GetEligiblePipeType,
  GetPrimaryObjectRewards,
  GetReservedType,
  GetRewardsByRequiredObjectType,
  GetRewardsEligibleType,
  GetRewardsMainType,
  GetSortedCampaignMainType,
  GetSortedRewardsReservedType,
  GetSponsorsType,
  RewardsAllType,
  RewardsByObjectType,
  RewardsByRequiredType,
  RewardsMainType,
  RewardsTabType,
} from './types/rewards-all.types';
import { WobjectHelperInterface } from '../../wobject/interface';
import { AppRepositoryInterface } from '../../../persistance/app/interface';
import { RewardsAllInterface } from './interface/rewards-all.interface';
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import { UserRepositoryInterface } from '../../../persistance/user/interface';
import { configService } from '../../../common/config';
import { GuidePaymentsQueryInterface } from '../../campaign-payment/interface';
import { AddDataOnRewardsByObjectType } from '../../campaign-payment/types';
import { PipelineStage } from 'mongoose';

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
  ) {}

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
    };
    if (!userName) return errResponse;

    const user = await this.userRepository.findOne({
      filter: { name: userName },
      projection: { count_posts: 1, followers_count: 1, wobjects_weight: 1 },
    });
    const eligiblePipe = this.getEligiblePipe({ userName, user });
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
    const { rewards: eligible } = await this.getRewardsEligibleMain({
      userName,
      skip: 0,
      limit: 1,
      host: configService.getAppHost(),
    });
    if (eligible.length) return { tabType: REWARDS_TAB.ELIGIBLE };
    return { tabType: REWARDS_TAB.ALL };
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
    const rewards = [];
    const campaigns: CampaignDocumentType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              'users.status': RESERVATION_STATUS.ASSIGNED,
              'users.name': userName,
              ...(sponsors && { $in: sponsors }),
              ...(sponsors && { $in: type }),
            },
          },
        ],
      });

    const objects = await this.wobjectHelper.getWobjectsForCampaigns({
      links: _.uniq([
        ..._.map(campaigns, 'requiredObject'),
        ..._.map(campaigns, 'users.objectPermlink'),
      ]),
      host,
    });
    for (const campaign of campaigns) {
      const user = campaign.users.find(
        (u) => u.name === userName && u.status === RESERVATION_STATUS.ASSIGNED,
      );
      if (!user) continue;
      const object = objects.find(
        (o) => o.author_permlink === user.objectPermlink,
      );
      const payout = this.getPayedForMain([campaign]);
      const coordinates = _.compact(this.parseCoordinates(object?.map)) || [];
      rewards.push({
        payout,
        payoutToken: campaign.payoutToken,
        countReservationDays: campaign.countReservationDays,
        currency: campaign.currency,
        reward: campaign.reward,
        rewardInUSD: campaign.rewardInUSD,
        guideName: campaign.guideName,
        requirements: campaign.requirements,
        userRequirements: campaign.userRequirements,
        createdAt: campaign.createdAt,
        distance:
          area && coordinates.length === 2
            ? this.getDistance(area, coordinates)
            : null,
        object,
      });
    }
    const sorted = this.getSortedRewardsReserved({ sort, rewards });

    return {
      rewards: sorted.slice(skip, skip + limit),
      hasMore: sorted.slice(skip).length > limit,
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
              ...(sponsors && { $in: sponsors }),
              ...(sponsors && { $in: type }),
              ...(activationPermlink && { activationPermlink }),
            },
          },
          ...this.getEligiblePipe({ userName, user }),
        ],
      });
    return this.getPrimaryObjectRewards({
      skip,
      limit,
      host,
      sort,
      area,
      campaigns,
    });
  }

  async getEligibleByObject({
    skip,
    limit,
    host,
    sponsors,
    type,
    userName,
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
              ...(sponsors && { $in: sponsors }),
              ...(sponsors && { $in: type }),
            },
          },
          ...this.getEligiblePipe({ userName, user }),
          { $unwind: { path: '$objects' } },
          { $sort: { rewardInUsd: -1 } },
          { $skip: skip },
          { $limit: limit + 1 },
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
  }: GetRewardsMainType): Promise<RewardsAllType> {
    const campaigns = await this.campaignRepository.find({
      filter: {
        status: CAMPAIGN_STATUS.ACTIVE,
        ...(sponsors && { $in: sponsors }),
        ...(sponsors && { $in: type }),
      },
    });

    return this.getPrimaryObjectRewards({
      skip,
      limit,
      host,
      sort,
      area,
      campaigns,
    });
  }

  async getPrimaryObjectRewards({
    skip,
    limit,
    host,
    sort,
    area,
    campaigns,
  }: GetPrimaryObjectRewards): Promise<RewardsAllType> {
    const rewards = [];
    const objects = await this.wobjectHelper.getWobjectsForCampaigns({
      links: _.uniq(_.map(campaigns, 'requiredObject')),
      host,
    });

    const groupedCampaigns = _.groupBy(campaigns, 'requiredObject');
    for (const key in groupedCampaigns) {
      const object = objects.find((o) => o.author_permlink === key);
      const payout = this.getPayedForMain(groupedCampaigns[key]);
      const coordinates = _.compact(this.parseCoordinates(object?.map)) || [];
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
        distance:
          area && coordinates.length === 2
            ? this.getDistance(area, coordinates)
            : null,
        object,
        payout,
      });
    }

    const sorted = this.getSortedCampaignMain({ sort, rewards });

    return {
      rewards: sorted.slice(skip, skip + limit),
      hasMore: sorted.slice(skip).length > limit,
    };
  }

  parseCoordinates(map: string): number[] | null {
    try {
      const coordinates = JSON.parse(map);
      return [coordinates.longitude, coordinates.latitude];
    } catch (error) {
      return null;
    }
  }

  getDistance(first: number[], second: number[]): number {
    const EARTH_RADIUS = 6372795;
    const long1 = first[0] * (Math.PI / 180);
    const long2 = second[1] * (Math.PI / 180);
    const lat1 = first[1] * (Math.PI / 180);
    const lat2 = second[0] * (Math.PI / 180);

    const cl1 = Math.cos(lat1);
    const cl2 = Math.cos(lat2);
    const sl1 = Math.sin(lat1);
    const sl2 = Math.sin(lat2);
    const delta = long2 - long1;
    const cdelta = Math.cos(delta);
    const sdelta = Math.sin(delta);

    const y = Math.sqrt(
      Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2),
    );
    const x = sl1 * sl2 + cl1 * cl2 * cdelta;

    const ad = Math.atan2(y, x);
    return Math.round(ad * EARTH_RADIUS);
  }

  getPayedForMain(campaigns: CampaignDocumentType[]): number {
    return _.reduce(
      campaigns,
      (acc, el) => {
        const countPayments = _.filter(
          _.get(el, 'users', []),
          (payment) => payment.status === RESERVATION_STATUS.COMPLETED,
        ).length;
        const payed = countPayments
          ? countPayments * el.rewardInUSD * el.commissionAgreement
          : el.rewardInUSD * el.commissionAgreement;
        acc += payed;
        return acc;
      },
      0,
    );
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
  }: GetRewardsByRequiredObjectType): Promise<RewardsByObjectType> {
    const rewards: RewardsByRequiredType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              requiredObject,
              status: CAMPAIGN_STATUS.ACTIVE,
              ...(sponsors && { $in: sponsors }),
              ...(sponsors && { $in: type }),
            },
          },
          { $unwind: { path: '$objects' } },
          { $sort: { rewardInUsd: -1 } },
          { $skip: skip },
          { $limit: limit + 1 },
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

  async getSponsorsAll(requiredObject?: string): Promise<GetSponsorsType> {
    const sponsors: GetSponsorsType[] = await this.campaignRepository.aggregate(
      {
        pipeline: [
          {
            $match: {
              status: CAMPAIGN_STATUS.ACTIVE,
              ...(requiredObject && { requiredObject }),
            },
          },
          {
            $group: {
              _id: '$status',
              type: { $addToSet: '$type' },
              sponsors: { $addToSet: '$guideName' },
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
    return sponsors[0];
  }

  getEligiblePipe({ userName, user }: GetEligiblePipeType): PipelineStage[] {
    const currentDay = moment().format('dddd').toLowerCase();
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
          assignedUser: { $size: '$assignedUser' },
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
            $gte: [user.followers_count, '$userRequirements.followers'],
          },
          expertise: {
            $gte: [user.wobjects_weight, '$userRequirements.expertise'],
          },
          notAssigned: { $eq: ['$assignedUser', 0] },
          frequency: {
            $or: [
              { $gt: ['$daysPassed', '$frequencyAssign'] },
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
        return _.orderBy(
          rewards,
          [(reward) => reward.distance, 'payout'],
          ['asc', 'desc'],
        );
    }
  }

  getSortedRewardsReserved({
    sort,
    rewards,
  }: GetSortedRewardsReservedType): RewardsByRequiredType[] {
    switch (sort) {
      case CAMPAIGN_SORTS.DATE:
        return _.orderBy(rewards, ['createdAt'], ['desc']);
      case CAMPAIGN_SORTS.PROXIMITY:
        return _.sortBy(rewards, (campaign) => campaign.distance);
      case CAMPAIGN_SORTS.REWARD:
        return _.orderBy(rewards, ['reward', 'createdAt'], ['desc']);
      case CAMPAIGN_SORTS.PAYOUT:
        return _.orderBy(rewards, ['payout'], ['desc']);
      case CAMPAIGN_SORTS.DEFAULT:
      default:
        return _.orderBy(
          rewards,
          [(reward) => reward.distance, 'payout'],
          ['asc', 'desc'],
        );
    }
  }
}
