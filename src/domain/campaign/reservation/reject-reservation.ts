import { Inject, Injectable } from '@nestjs/common';
import {
  CAMPAIGN_PROVIDE,
  REDIS_KEY,
  REDIS_PROVIDE,
  RESERVATION_STATUS,
} from '../../../common/constants';
import { CampaignRepositoryInterface } from '../../../persistance/campaign/interface';
import * as _ from 'lodash';
import { validateAssignType, RejectReservationType } from './types';
import { CampaignHelperInterface } from '../interface';
import { RejectReservationInterface } from './interface';
import { RedisClientInterface } from '../../../services/redis/clients/interface';

@Injectable()
export class RejectReservation implements RejectReservationInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
  ) {}

  async rejectReservation({
    activationPermlink,
    reservationPermlink,
    rejectionPermlink,
    name,
  }: RejectReservationType): Promise<void> {
    const { isValid } = await this.validateRejectAssign({
      activationPermlink,
      reservationPermlink,
      rejectionPermlink,
      name,
    });
    if (!isValid) {
      await this.campaignRedisClient.publish(
        REDIS_KEY.PUBLISH_EXPIRE_RELEASE_FALSE,
        rejectionPermlink,
      );
      return;
    }

    const result = await this.campaignRepository.updateOne({
      filter: {
        activationPermlink,
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
    if (!result.modifiedCount) {
      await this.campaignRedisClient.publish(
        REDIS_KEY.PUBLISH_EXPIRE_RELEASE_FALSE,
        rejectionPermlink,
      );
      return;
    }
    await this.campaignRedisClient.publish(
      REDIS_KEY.PUBLISH_EXPIRE_RELEASE,
      rejectionPermlink,
    );
    await this.campaignHelper.delExpireAssign(reservationPermlink);
    await this.campaignHelper.checkOnHoldStatus(activationPermlink);
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
