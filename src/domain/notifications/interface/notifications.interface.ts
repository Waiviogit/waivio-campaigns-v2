import { SendNotificationType } from '../types/notification.types';

export interface NotificationsInterface {
  activateCampaign(_id: string): Promise<void>;
  deactivateCampaign(_id: string): Promise<void>;
  sendNotification({ id, data }: SendNotificationType): Promise<void>;
  sendPayableRecord(_id: string, userName: string): Promise<void>;
}
