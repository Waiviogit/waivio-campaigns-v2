import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import {
  CAMPAIGN_PROVIDE,
  RESERVATION_STATUS,
  REWARDS_PROVIDE,
  USER_SUBSCRIPTION_PROVIDE,
  WOBJECT_SUBSCRIPTION_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  CheckObjectsFollowingInterface,
  CheckUserFollowingsInterface,
  CheckUsersFollowingInterface,
  GetHistoryInterface,
  GetUserHistoryFiltersInterface,
  RewardsHelperInterface,
  UserHistoryInterface,
} from './interface';
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import {
  FilterUserHistoryAggType,
  FilterUserHistoryType,
  ObjectsFollowingType,
  RewardsByObjectType,
  UserAndObjectFollowing,
  UserFollowingType,
} from './types';
import { UserSubscriptionRepositoryInterface } from '../../../persistance/user-subscriptions/interface';
import { WobjectSubscriptionsRepositoryInterface } from '../../../persistance/wobject-subscriptions/interface';

@Injectable()
export class UserHistory implements UserHistoryInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(REWARDS_PROVIDE.HELPER)
    private readonly rewardsHelper: RewardsHelperInterface,
    @Inject(USER_SUBSCRIPTION_PROVIDE.REPOSITORY)
    private readonly userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @Inject(WOBJECT_SUBSCRIPTION_PROVIDE.REPOSITORY)
    private readonly wobjectSubscriptionsRepository: WobjectSubscriptionsRepositoryInterface,
  ) {}

  async getHistory({
    userName,
    sort,
    host,
    limit,
    skip,
    guideNames,
    statuses,
  }: GetHistoryInterface): Promise<RewardsByObjectType> {
    const campaigns: CampaignDocumentType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              'users.name': userName,
              ...(guideNames && { guideName: { $in: guideNames } }),
            },
          },
          { $unwind: { path: '$users' } },
          {
            $match: {
              'users.name': userName,
              ...(statuses && { 'users.status': { $in: statuses } }),
            },
          },
        ],
      });

    const rewards = await this.rewardsHelper.fillUserReservations({
      campaigns,
      sort,
      host,
    });

    return {
      rewards: rewards.slice(skip, skip + limit),
      hasMore: rewards.slice(skip).length > limit,
    };
  }

  async getFilters({
    userName,
  }: GetUserHistoryFiltersInterface): Promise<FilterUserHistoryType> {
    const names: FilterUserHistoryAggType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              'users.name': userName,
            },
          },
          {
            $group: {
              _id: null,
              guideNames: { $addToSet: '$guideName' },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ],
      });
    if (_.isEmpty(names)) {
      return { statuses: Object.values(RESERVATION_STATUS), guideNames: [] };
    }

    return {
      statuses: Object.values(RESERVATION_STATUS),
      guideNames: names[0].guideNames,
    };
  }

  async checkUserFollowings({
    users,
    objects,
    user,
  }: CheckUserFollowingsInterface): Promise<UserAndObjectFollowing> {
    const usersSubs = await this.checkUsersFollowing({ user, users });
    const wobjectSubs = await this.checkObjectsFollowing({ user, objects });

    return {
      users: usersSubs,
      objects: wobjectSubs,
    };
  }

  async checkUsersFollowing({
    user,
    users,
  }: CheckUsersFollowingInterface): Promise<UserFollowingType[]> {
    const usersSubs = await this.userSubscriptionRepository.find({
      filter: { follower: user, following: { $in: users } },
    });
    const usersList = _.map(usersSubs, 'following');
    return users.map((u) => ({ name: u, follow: usersList.includes(u) }));
  }

  async checkObjectsFollowing({
    user,
    objects,
  }: CheckObjectsFollowingInterface): Promise<ObjectsFollowingType[]> {
    const wobjectSubs = await this.wobjectSubscriptionsRepository.find({
      filter: { follower: user, following: { $in: objects } },
    });
    const objectsList = _.map(wobjectSubs, 'following');
    return objects.map((o) => ({
      authorPermlink: o,
      follow: objectsList.includes(o),
    }));
  }
}
