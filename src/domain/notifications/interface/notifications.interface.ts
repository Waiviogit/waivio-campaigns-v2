export interface NotificationsInterface {
  activateCampaign(_id: string): Promise<void>;
  deactivateCampaign(_id: string): Promise<void>;
}
