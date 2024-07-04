import { getCampaignRequirementsType } from '../types/campaign-details.types';

export interface getCampaignRequirementsInterface {
  host: string;
  campaignId: string;
  object: string;
}

export interface CampaignDetailsInterface {
  getCampaignRequirements(
    data: getCampaignRequirementsInterface,
  ): Promise<getCampaignRequirementsType>;
}
