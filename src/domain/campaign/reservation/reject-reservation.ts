import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUSES_FOR_ON_HOLD,
  RESERVATION_STATUS,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import * as _ from 'lodash';
import { validateAssignType, RejectReservationType } from './types';
import { CampaignHelperInterface } from '../interface';
import { RejectReservationInterface } from './interface';

@Injectable()
export class RejectReservation implements RejectReservationInterface {
  private readonly logger = new Logger(RejectReservation.name);
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async rejectReservation({
    activationPermlink,
    reservationPermlink,
    rejectionPermlink,
    name,
  }: RejectReservationType): Promise<void> {
    const { isValid, message } = await this.validateRejectAssign({
      activationPermlink,
      reservationPermlink,
      rejectionPermlink,
      name,
    });
    if (!isValid) {
      //TODO REMOVE
      this.logger.error(`Not Valid ${message}`);
      return;
    }

    const result = await this.campaignRepository.updateOne({
      filter: {
        activationPermlink,
        status: { $in: CAMPAIGN_STATUSES_FOR_ON_HOLD },
        users: {
          $elemMatch: {
            name,
            status: RESERVATION_STATUS.ASSIGNED,
            reservationPermlink,
          },
        },
      },
      update: {
        $set: {
          'users.$.status': RESERVATION_STATUS.UNASSIGNED,
          'users.$.rejectionPermlink': rejectionPermlink,
        },
      },
    });
    if (result) {
      await this.campaignHelper.delExpireAssign(reservationPermlink);
      await this.campaignHelper.checkOnHoldStatus(activationPermlink);
    }
  }

  async validateRejectAssign({
    activationPermlink,
    reservationPermlink,
    rejectionPermlink,
    name,
  }: RejectReservationType): Promise<validateAssignType> {
    const campaign = await this.campaignRepository.findOne({
      filter: { activationPermlink },
    });

    if (!campaign || !reservationPermlink || !name || !rejectionPermlink) {
      return {
        isValid: false,
        message:
          'Invalid campaign activation permlink, rejection permlink, reservation permlink or invalid user',
      };
    }

    const user = _.find(
      campaign.users,
      (_user) =>
        _user.name === name &&
        _user.status === RESERVATION_STATUS.ASSIGNED &&
        _user.reservationPermlink === reservationPermlink,
    );

    if (!user) return { isValid: false, message: 'Reservation not exist' };

    const existPermlink = await this.campaignRepository.findOne({
      filter: {
        'users.rejectionPermlink': rejectionPermlink,
      },
    });

    if (existPermlink) {
      return { isValid: false, message: 'rejection permlink not unique' };
    }

    return { isValid: true };
  }
}
