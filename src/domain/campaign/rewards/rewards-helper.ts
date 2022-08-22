import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import {
  CAMPAIGN_SORTS,
  RESERVATION_STATUS,
  WOBJECT_PROVIDE,
} from '../../../common/constants';
import { GetSortedRewardsReservedType, RewardsByRequiredType } from './types';
import { WobjectHelperInterface } from '../../wobject/interface';
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import {
  FillUserReservationsInterface,
  RewardsHelperInterface,
} from './interface';

@Injectable()
export class RewardsHelper implements RewardsHelperInterface {
  constructor(
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
  ) {}

  async fillUserReservations({
    campaigns,
    host,
    area,
    sort,
  }: FillUserReservationsInterface): Promise<RewardsByRequiredType[]> {
    const rewards = [];

    const objects = await this.wobjectHelper.getWobjectsForCampaigns({
      links: _.uniq([
        ..._.map(campaigns, 'requiredObject'),
        ..._.reduce(
          campaigns,
          (acc, el) => {
            acc.push(_.get(el.users, 'objectPermlink'));
            return acc;
          },
          [],
        ),
      ]),
      host,
    });

    for (const campaign of campaigns) {
      const user = _.get(campaign, 'users');
      if (!user) continue;
      const object = objects.find(
        (o) => o.author_permlink === user.objectPermlink,
      );
      const payout = this.getPayedForMain([campaign]);
      const coordinates = _.compact(this.parseCoordinates(object?.map)) || [];
      const requiredObject = objects.find(
        (o) => o.author_permlink === campaign.requiredObject,
      );
      rewards.push({
        _id: campaign._id,
        payout,
        campaignName: campaign.name,
        payoutToken: campaign.payoutToken,
        countReservationDays: campaign.countReservationDays,
        currency: campaign.currency,
        reward: campaign.reward,
        rewardInUSD: campaign.rewardInUSD,
        guideName: campaign.guideName,
        userName: user.name,
        reviewStatus: user.status,
        requirements: campaign.requirements,
        userRequirements: campaign.userRequirements,
        createdAt: campaign.createdAt,
        activationPermlink: campaign.activationPermlink,
        reservationPermlink: user.reservationPermlink,
        commentsCount: user.commentsCount || 0,
        distance:
          area && coordinates.length === 2
            ? this.getDistance(area, coordinates)
            : null,
        object,
        requiredObject: _.pick(requiredObject, [
          'avatar',
          'name',
          'default_name',
          'defaultShowLink',
          'author_permlink',
        ]),
      });
    }
    return this.getSortedRewardsReserved({ sort, rewards });
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
}
