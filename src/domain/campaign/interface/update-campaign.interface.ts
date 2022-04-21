import { Campaign } from '../../../persistance/campaign/campaign.schema';
import { UpdateCampaignDto } from '../../../common/dto/campaign/in';
import {
  CampaignDocumentType,
  UpdateCampaignType,
} from '../../../persistance/campaign/types';

export interface UpdateCampaignInterface {
  update(campaign: UpdateCampaignType): Promise<CampaignDocumentType>;
}
