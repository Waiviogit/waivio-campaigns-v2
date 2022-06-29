export interface CampaignExpiredListenerInterface {
  listener(key: string): Promise<void>;
}
