import { Campaign } from '../../../persistance/campaign/campaign.schema';
import { UpdateCampaignDto } from '../../../common/dto/in';

export interface UpdateCampaignInterface {
  update(campaign: UpdateCampaignDto): Promise<Campaign>;
}
