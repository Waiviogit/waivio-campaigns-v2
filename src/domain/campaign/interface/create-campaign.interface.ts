import {
  CampaignDocumentType,
  CreateCampaignType,
} from '../../../persistance/campaign/types';

export interface CreateCampaignInterface {
  create(
    campaign: Omit<CreateCampaignType, 'rewardInUSD'>,
  ): Promise<CampaignDocumentType>;
}
