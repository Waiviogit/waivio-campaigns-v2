import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import {
  CAMPAIGN_PROVIDE,
  RESERVATION_STATUS,
  REWARDS_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  GetHistoryInterface,
  GetUserHistoryFiltersInterface,
  RewardsHelperInterface,
  UserHistoryInterface,
} from './interface';
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import {
  FilterUserHistoryAggType,
  FilterUserHistoryType,
  RewardsByObjectType,
} from './types';

@Injectable()
export class UserHistory implements UserHistoryInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(REWARDS_PROVIDE.HELPER)
    private readonly rewardsHelper: RewardsHelperInterface,
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
}
