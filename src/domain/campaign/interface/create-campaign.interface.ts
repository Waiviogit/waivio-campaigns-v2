import { CreateCampaignDto } from '../../../common/dto/in';
import { Campaign } from '../../../persistance/campaign/campaign.schema';

export interface CreateCampaignInterface {
  create(campaign: CreateCampaignDto): Promise<Campaign>;
}
