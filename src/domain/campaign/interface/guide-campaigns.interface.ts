import { GuideActiveCampaignType } from '../types';

export interface GuideCampaignsInterface {
  getActiveCampaigns(guideName: string): Promise<GuideActiveCampaignType[]>;
}
