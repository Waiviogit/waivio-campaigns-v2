import { Inject, Injectable } from '@nestjs/common';
import {
  CAMPAIGN_PROVIDE,
  RESERVATION_STATUS,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import * as _ from 'lodash';

import { CampaignHelperInterface } from '../interface';
import { GuideRejectReservationType, UpdateCampaignReviewType } from './types';
import { GuideRejectReservationInterface } from './interface';

@Injectable()
export class GuideRejectReservation implements GuideRejectReservationInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
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
        //TODO remove payment histories
        await this.updateCampaignReview({
          _id: campaign._id,
          user,
          rejectionPermlink,
        });
        break;
    }
  }
}
