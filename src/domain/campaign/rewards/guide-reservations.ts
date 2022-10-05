import { CampaignDocumentType } from '../../../persistance/campaign/types';
import * as _ from 'lodash';
import * as moment from 'moment';
import {
  BLACKLIST_PROVIDE,
  CAMPAIGN_PROVIDE,
  CONVERSATION_STATUS,
  RESERVATION_STATUS,
  REWARDS_PROVIDE,
} from '../../../common/constants';
import { Inject, Injectable } from '@nestjs/common';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import {
  GetGuideReservationFiltersInterface,
  GetReservationMessagesInterface,
  GetReservationsInterface,
  GetReviewFraudsInterface,
  GuideReservationsInterface,
  RewardsHelperInterface,
} from './interface';
import {
  FilterReservationsAggType,
  FilterReservationsType,
  InBlacklistType,
  RewardsByObjectType,
} from './types';
import {
  BlacklistHelperInterface,
  CheckUserInBlacklistInterface,
} from '../../blacklist/interface';

@Injectable()
export class GuideReservations implements GuideReservationsInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(REWARDS_PROVIDE.HELPER)
    private readonly rewardsHelper: RewardsHelperInterface,
    @Inject(BLACKLIST_PROVIDE.HELPER)
    private readonly blacklistHelper: BlacklistHelperInterface,
  ) {}

  async getReservationMessages({
    guideName,
    caseStatus,
    statuses,
    host,
    sort,
    skip,
    limit,
    reservationPermlink,
  }: GetReservationMessagesInterface): Promise<RewardsByObjectType> {
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
              ...(statuses && { 'users.status': { $in: statuses } }),
              ...(caseStatus !== CONVERSATION_STATUS.ALL && {
                'users.openConversation':
                  caseStatus !== CONVERSATION_STATUS.CLOSE,
              }),
              ...(reservationPermlink && {
                'users.reservationPermlink': reservationPermlink,
              }),
              'users.commentsCount': { $gt: 0 },
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
              users: { $ne: [] },
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $project: {
              _id: 0,
              name: 1,
            },
          },
        ],
      });
    if (_.isEmpty(names)) {
      return { statuses: Object.values(RESERVATION_STATUS), campaignNames: [] };
    }

    return {
      statuses: Object.values(RESERVATION_STATUS),
      campaignNames: _.map(names, 'name'),
    };
  }

  async checkUserInBlacklist({
    guideName,
    userName,
  }: CheckUserInBlacklistInterface): Promise<InBlacklistType> {
    const { blacklist } = await this.blacklistHelper.getBlacklist(guideName);
    return { inBlacklist: blacklist.includes(userName) };
  }
}
