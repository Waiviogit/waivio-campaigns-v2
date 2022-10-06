import { Inject, Injectable } from '@nestjs/common';
import {
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_PROVIDE,
  RESERVATION_STATUS,
  SPONSORS_BOT_PROVIDE,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import * as _ from 'lodash';

import {
  CampaignHelperInterface,
  CampaignSuspendInterface,
} from '../interface';
import { GuideRejectReservationType, UpdateCampaignReviewType } from './types';
import { GuideRejectReservationInterface } from './interface';
import { SponsorsBotInterface } from '../../sponsors-bot/interface';
import { CampaignPaymentRepository } from '../../../persistance/campaign-payment/campaign-payment.repository';

@Injectable()
export class GuideRejectReservation implements GuideRejectReservationInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPayment: CampaignPaymentRepository,
    @Inject(CAMPAIGN_PROVIDE.SUSPEND)
    private readonly campaignSuspend: CampaignSuspendInterface,
  ) {}

  private async updateCampaignReview({
    _id,
    user,
    rejectionPermlink,
  }: UpdateCampaignReviewType): Promise<void> {
    await this.campaignRepository.updateOne({
      filter: {
        _id,
        users: {
          $elemMatch: {
            name: user.name,
            status: user.status,
            reservationPermlink: user.reservationPermlink,
          },
        },
      },
      update: {
        $set: {
          'users.$.status': RESERVATION_STATUS.REJECTED,
          'users.$.rejectionPermlink': rejectionPermlink,
        },
      },
    });
  }

  async reject({
    reservationPermlink,
    guideName,
    rejectionPermlink,
  }: GuideRejectReservationType): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      filter: {
        guideName: guideName,
        users: {
          $elemMatch: { reservationPermlink },
        },
      },
    });
    if (!campaign) return;

    const user = _.find(
      campaign.users,
      (user) => user.reservationPermlink === reservationPermlink,
    );
    if (!user) return;
    switch (user.status) {
      case RESERVATION_STATUS.ASSIGNED:
        await this.updateCampaignReview({
          _id: campaign._id,
          user,
          rejectionPermlink,
        });
        await this.campaignHelper.checkOnHoldStatus(
          campaign.activationPermlink,
        );
        break;
      case RESERVATION_STATUS.COMPLETED:
        await this.updateCampaignReview({
          _id: campaign._id,
          user,
          rejectionPermlink,
        });
        await this.sponsorsBot.removeVotesOnReview({ reservationPermlink });
        await this.campaignPayment.deleteMany({
          filter: { reservationPermlink },
        });
        break;
    }
    await this.campaignSuspend.checkGuideForUnblock(guideName);
  }
}
