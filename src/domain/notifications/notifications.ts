import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as _ from 'lodash';

import { configService } from '../../common/config';
import {
  SendBellNotificationType,
  SendNotificationType,
} from './types/notification.types';
import {
  BLOCK_MAIN_PROCESSOR,
  CAMPAIGN_PROVIDE,
  NOTIFICATION_ID,
  USER_SUBSCRIPTION_PROVIDE,
  WOBJECT_PROVIDE,
  WOBJECT_SUBSCRIPTION_PROVIDE,
} from '../../common/constants';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { Campaign } from '../../persistance/campaign/campaign.schema';
import { UserSubscriptionRepositoryInterface } from '../../persistance/user-subscriptions/interface';
import { WobjectSubscriptionsRepositoryInterface } from '../../persistance/wobject-subscriptions/interface';
import { NotificationsInterface } from './interface';
import { WobjectHelperInterface } from '../wobject/interface';

@Injectable()
export class Notifications implements NotificationsInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(USER_SUBSCRIPTION_PROVIDE.REPOSITORY)
    private readonly userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @Inject(WOBJECT_SUBSCRIPTION_PROVIDE.REPOSITORY)
    private readonly wobjectSubscriptionsRepository: WobjectSubscriptionsRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
  ) {}

  private async notificationRequest(data: unknown): Promise<void> {
    try {
      await axios.post(configService.getNotificationsRoute(), data, {
        headers: { API_KEY: configService.getNotificationsKey() },
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  private sendNotification = async ({
    id,
    data,
  }: SendNotificationType): Promise<void> => {
    const reqData = {
      id: id,
      block: process.env[BLOCK_MAIN_PROCESSOR],
      data,
    };

    this.notificationRequest(reqData);
  };

  private async getUsersSubscribedOnCampaign(
    campaign: Campaign,
  ): Promise<string[]> {
    const userSubscriptions =
      await this.userSubscriptionRepository.findUserSubscriptions(
        campaign.guideName,
      );

    const objectSubscriptions =
      await this.wobjectSubscriptionsRepository.findUserSubscriptions(
        campaign.requiredObject,
      );

    return _.uniq([...userSubscriptions, ...objectSubscriptions]);
  }

  private async sendBellNotification({
    objects,
    primaryObject,
    guideName,
  }: SendBellNotificationType): Promise<void> {
    for (const object of objects) {
      const users =
        await this.wobjectSubscriptionsRepository.findUserSubscriptions(object);

      if (_.isEmpty(users)) continue;

      const objectName = await this.wobjectHelper.getWobjectName(object);
      await this.sendNotification({
        id: NOTIFICATION_ID.BELL_WOBJ_REWARDS,
        data: {
          objectName,
          objectPermlink: object,
          users,
          primaryObject,
          guideName,
        },
      });
    }
  }

  async activateCampaign(_id: string): Promise<void> {
    const campaign = await this.campaignRepository.findCampaignById(_id);
    if (!campaign) return;
    const users = await this.getUsersSubscribedOnCampaign(campaign);
    if (_.isEmpty(users)) return;

    const object_name = await this.wobjectHelper.getWobjectName(
      campaign.requiredObject,
    );

    await this.sendNotification({
      id: NOTIFICATION_ID.ACTIVATION_CAMPAIGN,
      data: {
        guide: campaign.guideName,
        users,
        author_permlink: campaign.requiredObject,
        object_name,
      },
    });
    await this.sendBellNotification({
      objects: campaign.objects,
      primaryObject: campaign.requiredObject,
      guideName: campaign.guideName,
    });
  }

  async deactivateCampaign(_id: string): Promise<void> {
    const campaign = await this.campaignRepository.findCampaignById(_id);
    if (!campaign) return;
    const users =
      await this.wobjectSubscriptionsRepository.findUserSubscriptions(
        campaign.requiredObject,
      );

    const object_name = await this.wobjectHelper.getWobjectName(
      campaign.requiredObject,
    );

    await this.sendNotification({
      id: NOTIFICATION_ID.DEACTIVATION_CAMPAIGN,
      data: {
        guide: campaign.guideName,
        users: _.uniq([...users, campaign.guideName]),
        author_permlink: campaign.requiredObject,
        object_name,
      },
    });
  }
}
