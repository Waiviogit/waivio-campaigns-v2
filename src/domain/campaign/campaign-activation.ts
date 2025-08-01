import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { CampaignActivationInterface } from './interface/campaign-activation.interface';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  NOTIFICATIONS_PROVIDE,
  WOBJECT_PROVIDE,
} from '../../common/constants';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { WobjectRepositoryInterface } from '../../persistance/wobject/interface';
import { NotificationsInterface } from '../notifications/interface';
import {
  validateActivationDeactivationType,
  ActivateCampaignType,
} from './types';

@Injectable()
export class CampaignActivation implements CampaignActivationInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.REPOSITORY)
    private readonly wobjectRepository: WobjectRepositoryInterface,
    @Inject(NOTIFICATIONS_PROVIDE.SERVICE)
    private readonly notifications: NotificationsInterface,
  ) {}

  async activate({
    _id,
    guideName,
    permlink,
  }: ActivateCampaignType): Promise<void> {
    const result = await this.validateActivation({ _id, guideName, permlink });
    if (!result.isValid) return;

    const suspendedCampaign = await this.campaignRepository.findOneSuspended(
      guideName,
    );
    const status = suspendedCampaign
      ? CAMPAIGN_STATUS.SUSPENDED
      : CAMPAIGN_STATUS.ACTIVE;

    const activatedCampaign = await this.campaignRepository.activateCampaign({
      _id,
      guideName,
      permlink,
      status,
    });

    if (activatedCampaign) {
      await this.wobjectRepository.updateCampaignsCount(_id, status, [
        activatedCampaign.requiredObject,
        ...activatedCampaign.objects,
      ]);
      await this.notifications.activateCampaign(_id);
    }
  }

  async validateActivation({
    _id,
    guideName,
    permlink,
  }: ActivateCampaignType): Promise<validateActivationDeactivationType> {
    const campaign = await this.campaignRepository.findOnePending(
      _id,
      guideName,
    );
    const limitDate = new Date();
    limitDate.setMinutes(limitDate.getMinutes() + 10);

    if (!campaign || !permlink) {
      return {
        isValid: false,
        message:
          'Invalid campaignId or activation permlink. Campaign status must be pending',
      };
    }

    const existCampaign =
      await this.campaignRepository.findActiveByActivationLink(permlink);

    if (!_.isEmpty(existCampaign)) {
      return {
        isValid: false,
        message: 'Permlink is not unique',
      };
    }

    if (campaign.expiredAt < limitDate) {
      return {
        isValid: false,
        message: 'Expiration time is invalid',
      };
    }

    const requiredObject = await this.wobjectRepository.findUnavailableByLink(
      campaign.requiredObject,
    );

    if (requiredObject) {
      return {
        isValid: false,
        message: 'Required object is relisted or unavailable',
      };
    }

    return {
      isValid: true,
      message: 'ok',
    };
  }
}
