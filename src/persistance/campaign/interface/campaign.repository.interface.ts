import { Campaign, CampaignDocumentType } from '../campaign.schema';
import { CreateCampaignDto } from '../../../common/dto/in';

export interface CampaignRepositoryInterface {
  create(campaign: CreateCampaignDto): Promise<Campaign>;
}
