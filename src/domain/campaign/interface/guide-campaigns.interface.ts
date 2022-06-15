import {
  getInactiveCampaignsType,
  GuideBalanceType,
  GuideManageCampaignType,
  InactiveCampaignsType,
} from '../types';

export interface GuideCampaignsInterface {
  getActiveCampaigns(guideName: string): Promise<GuideManageCampaignType[]>;
  getBalance(guideName: string): Promise<GuideBalanceType>;
  getInactiveCampaigns({
    guideName,
    skip,
    limit,
  }: getInactiveCampaignsType): Promise<InactiveCampaignsType>;
}
