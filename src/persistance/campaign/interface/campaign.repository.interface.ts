import { CreateCampaignDto } from '../../../common/dto/in';
import { Campaign } from '../campaign.schema';

export interface CampaignRepositoryInterface {
  create(campaign: CreateCampaignDto): Promise<Campaign>;
}
