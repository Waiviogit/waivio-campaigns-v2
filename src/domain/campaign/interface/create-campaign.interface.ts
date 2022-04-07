import {
  CampaignDocumentType,
  CreateCampaignType,
} from '../../../persistance/campaign/types';

export interface CreateCampaignInterface {
  create(campaign: CreateCampaignType): Promise<CampaignDocumentType>;
}
