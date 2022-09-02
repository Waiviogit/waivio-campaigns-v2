import { CampaignDocumentType } from '../../../persistance/campaign/types';
import * as _ from 'lodash';
import * as moment from 'moment';
import {
  CAMPAIGN_PROVIDE,
  RESERVATION_STATUS,
  REWARDS_PROVIDE,
} from '../../../common/constants';
import { Inject, Injectable } from '@nestjs/common';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  GetGuideReservationFiltersInterface,
  GetReservationsInterface,
  GetReviewFraudsInterface,
  GuideReservationsInterface,
  RewardsHelperInterface,
} from './interface';
import {
  FilterReservationsAggType,
  FilterReservationsType,
  RewardsByObjectType,
} from './types';

@Injectable()
export class GuideReservations implements GuideReservationsInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(REWARDS_PROVIDE.HELPER)
    private readonly rewardsHelper: RewardsHelperInterface,
  ) {}

  async getReviewFrauds({
    guideName,
    host,
    sort,
    skip,
    limit,
  }: GetReviewFraudsInterface): Promise<RewardsByObjectType> {
    const campaigns: CampaignDocumentType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              guideName,
            },
          },
          { $unwind: { path: '$users' } },
          {
            $match: {
              'users.status': RESERVATION_STATUS.COMPLETED,
              'users.fraudSuspicion': true,
              'users.completedAt': {
                $gte: moment().subtract(30, 'day').toDate(),
              },
            },
          },
        ],
      });

    const rewards = await this.rewardsHelper.fillUserReservations({
      campaigns,
      sort,
      host,
      showFraud: true,
    });

    return {
      rewards: rewards.slice(skip, skip + limit),
      hasMore: rewards.slice(skip).length > limit,
    };
  }

  async getReservations({
    guideName,
    campaignNames,
    statuses,
    skip,
    limit,
    host,
    sort,
  }: GetReservationsInterface): Promise<RewardsByObjectType> {
    const campaigns: CampaignDocumentType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              guideName,
              ...(campaignNames && { name: { $in: campaignNames } }),
            },
          },
          { $unwind: { path: '$users' } },
          {
            $match: {
              ...(statuses && { 'users.status': { $in: statuses } }),
            },
          },
        ],
      });

    const rewards = await this.rewardsHelper.fillUserReservations({
      campaigns,
      sort,
      host,
      showFraud: true,
    });

    return {
      rewards: rewards.slice(skip, skip + limit),
      hasMore: rewards.slice(skip).length > limit,
    };
  }

  async getFilters({
    guideName,
  }: GetGuideReservationFiltersInterface): Promise<FilterReservationsType> {
    const names: FilterReservationsAggType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              guideName,
            },
          },
          {
            $group: {
              _id: null,
              campaignNames: { $addToSet: '$name' },
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
      return { statuses: Object.values(RESERVATION_STATUS), campaignNames: [] };
    }

    return {
      statuses: Object.values(RESERVATION_STATUS),
      campaignNames: names[0].campaignNames,
    };
  }
}
