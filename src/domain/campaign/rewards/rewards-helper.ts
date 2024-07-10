import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import {
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_SORTS,
  HIDDEN_POST_PROVIDE,
  MUTED_USER_PROVIDE,
  PAYOUT_TOKEN,
  POST_PROVIDE,
  RESERVATION_STATUS,
  WOBJECT_PROVIDE,
} from '../../../common/constants';
import { GetSortedRewardsReservedType, RewardsByRequiredType } from './types';
import { WobjectHelperInterface } from '../../wobject/interface';
import { CampaignDocumentType } from '../../../persistance/campaign/types';
import {
  AddMutedAndHiddenInterface,
  FillUserReservationsInterface,
  RewardsHelperInterface,
} from './interface';
import { GuidePaymentsQueryInterface } from '../../campaign-payment/interface';
import { MutedUserRepositoryInterface } from '../../../persistance/muted-user/interface';
import { HiddenPostRepositoryInterface } from '../../../persistance/hidden-post/interface';
import { PostRepositoryInterface } from '../../../persistance/post/interface';

@Injectable()
export class RewardsHelper implements RewardsHelperInterface {
  constructor(
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.GUIDE_PAYMENTS_Q)
    private readonly guidePaymentsQuery: GuidePaymentsQueryInterface,
    @Inject(MUTED_USER_PROVIDE.REPOSITORY)
    private readonly mutedUserRepository: MutedUserRepositoryInterface,
    @Inject(HIDDEN_POST_PROVIDE.REPOSITORY)
    private readonly hiddenPostRepository: HiddenPostRepositoryInterface,
    @Inject(POST_PROVIDE.REPOSITORY)
    private readonly postRepository: PostRepositoryInterface,
  ) {}

  extractUsername(name: string): string {
    return name.slice(1);
  }

  getCampaignUsersFromArray(objects: string[]): string[] {
    return objects.reduce((acc, el) => {
      const user = el.startsWith('@');
      if (user) acc.push(el.slice(1));
      return acc;
    }, []);
  }

  filterObjectLinks(objects: string[]): string[] {
    const pattern = /@|https:\/\//;
    return objects.filter((el) => !pattern.test(el));
  }

  async addMutedAndHidden({
    rewards,
    guideName,
  }: AddMutedAndHiddenInterface): Promise<RewardsByRequiredType[]> {
    if (_.isEmpty(rewards)) return rewards;
    const mutedDocs = await this.mutedUserRepository.find({
      filter: { mutedBy: guideName },
    });
    const mutedUsers = _.map(mutedDocs, 'userName');

    const postFilterQuery = rewards.map((r) => ({
      author: r.userName,
      permlink: r.reviewPermlink,
    }));

    const postsIds = await this.postRepository.find({
      filter: { $or: postFilterQuery },
      projection: { author: 1, permlink: 1 },
    });

    for (const reward of rewards) {
      reward.muted = _.includes(mutedUsers, reward.userName);
      const postWithId = _.find(
        postsIds,
        (p) =>
          p.author === reward.userName && p.permlink === reward.reviewPermlink,
      );
      const hidden = await this.hiddenPostRepository.findOne({
        filter: {
          userName: guideName,
          postId: _.get(postWithId, '_id', '').toString(),
        },
      });
      reward.isHide = !!hidden;
    }
    return rewards;
  }

  async fillUserReservations({
    campaigns,
    host,
    area,
    sort,
    showFraud,
  }: FillUserReservationsInterface): Promise<RewardsByRequiredType[]> {
    const rewards = [];

    const totalGuidePayments =
      await this.guidePaymentsQuery.getGuidesTotalPayed({
        guideNames: _.map(campaigns, 'guideName'),
        payoutToken: _.get(campaigns, '[0].payoutToken', PAYOUT_TOKEN.WAIV),
      });

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
      const payment = _.find(
        totalGuidePayments,
        (el) => (el.guideName = campaign.guideName),
      );

      rewards.push({
        _id: campaign._id,
        payout,
        totalPayed: _.get(payment, 'payed', 0),
        campaignName: campaign.name,
        payoutToken: campaign.payoutToken,
        countReservationDays: campaign.countReservationDays,
        currency: campaign.currency,
        reward: campaign.reward,
        type: campaign.type,
        rewardInUSD: campaign.rewardInUSD,
        guideName: campaign.guideName,
        userName: user.name,
        rootName: user.rootName,
        reviewStatus: user.status,
        requirements: campaign.requirements,
        userRequirements: campaign.userRequirements,
        createdAt: campaign.createdAt,
        activationPermlink: campaign.activationPermlink,
        reservationPermlink: user.reservationPermlink,
        reviewPermlink: user.reviewPermlink,
        ...(user.rejectionPermlink && {
          rejectionPermlink: user.rejectionPermlink,
        }),
        commentsCount: user.commentsCount || 0,
        reservationCreatedAt: user.createdAt,
        reservationUpdatedAt: user.updatedAt,
        payoutTokenRateUSD: user.payoutTokenRateUSD,
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
          'map',
        ]),
        ...(showFraud && { fraudCodes: user.fraudCodes }),
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
      case CAMPAIGN_SORTS.RESERVATION:
      case CAMPAIGN_SORTS.INQUIRY_DATE:
        return _.orderBy(rewards, ['reservationCreatedAt'], ['desc']);
      case CAMPAIGN_SORTS.LAST_ACTION:
      case CAMPAIGN_SORTS.LATEST:
        return _.orderBy(rewards, ['reservationUpdatedAt'], ['desc']);

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
