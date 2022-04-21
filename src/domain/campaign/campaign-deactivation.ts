import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import {
  ACTIVE_CAMPAIGN_STATUSES,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  NOTIFICATIONS_PROVIDE,
  RESERVATION_STATUS,
  WOBJECT_PROVIDE,
} from '../../common/constants';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { WobjectRepositoryInterface } from '../../persistance/wobject/interface';
import { NotificationsInterface } from '../notifications/interface';
import {
  DeactivateCampaignType,
  validateActivationDeactivationType,
} from './types';
import { CampaignDeactivationInterface } from './interface';

@Injectable()
export class CampaignDeactivation implements CampaignDeactivationInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.REPOSITORY)
    private readonly wobjectRepository: WobjectRepositoryInterface,
    @Inject(NOTIFICATIONS_PROVIDE.SERVICE)
    private readonly notifications: NotificationsInterface,
  ) {}

  async deactivate({
    guideName,
    deactivationPermlink,
    activationPermlink,
  }: DeactivateCampaignType): Promise<void> {
    const result = await this.validateDeactivation({
      guideName,
      deactivationPermlink,
      activationPermlink,
    });

    if (!result.isValid) return;
    const campaign =
      await this.campaignRepository.findCampaignByStatusGuideNameActivation({
        statuses: ACTIVE_CAMPAIGN_STATUSES,
        guideName,
        activationPermlink,
      });

    const assigns = _.filter(
      campaign.users,
      (user) => user.status === RESERVATION_STATUS.ASSIGNED,
    );
    const status = assigns.length
      ? CAMPAIGN_STATUS.ON_HOLD
      : CAMPAIGN_STATUS.INACTIVE;

    const deactivatedCampaign = await this.campaignRepository.updateOne({
      filter: {
        activationPermlink,
        guideName,
        status: { $in: ACTIVE_CAMPAIGN_STATUSES },
      },
      update: {
        status,
        deactivationPermlink,
        stoppedAt: process.env.BLOCK_MAIN_TIMESTAMP,
      },
    });

    if (deactivatedCampaign) {
      await this.wobjectRepository.updateCampaignsCount(campaign._id, status, [
        campaign.requiredObject,
        ...campaign.objects,
      ]);
      await this.notifications.deactivateCampaign(campaign._id.toString());
    }
  }

  async validateDeactivation({
    guideName,
    deactivationPermlink,
    activationPermlink,
  }: DeactivateCampaignType): Promise<validateActivationDeactivationType> {
    const campaign =
      await this.campaignRepository.findCampaignByStatusGuideNameActivation({
        statuses: ACTIVE_CAMPAIGN_STATUSES,
        guideName,
        activationPermlink,
      });

    if (!deactivationPermlink) {
      return {
        isValid: false,
        message: 'Deactivation permlink must be exist',
      };
    }
    if (!campaign) {
      return { isValid: false, message: 'Campaign not exist' };
    }

    return { isValid: true, message: 'ok' };
  }
}
