import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { configService } from '../../common/config';
import { SendNotificationType } from './types/notification.types';

@Injectable()
export class Notifications {
  constructor() {}

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
      block: process.env.BLOCK_NUM,
      data,
    };

    this.notificationRequest(reqData);
  };
}
