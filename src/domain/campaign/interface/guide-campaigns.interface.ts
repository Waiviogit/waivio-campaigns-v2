import { GuideActiveCampaignType, GuideBalanceType } from '../types';

export interface GuideCampaignsInterface {
  getActiveCampaigns(guideName: string): Promise<GuideActiveCampaignType[]>;
  getBalance(guideName: string): Promise<GuideBalanceType>;
}
