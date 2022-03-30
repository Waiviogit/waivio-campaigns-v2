import { CreateCampaignDto } from '../../../common/dto/in';
import { Campaign } from '../campaign.schema';
import { CampaignFindOneType } from '../types';

export interface CampaignRepositoryInterface {
  create(campaign: CreateCampaignDto): Promise<Campaign>;
  findOne({
    filter,
    projection,
    options,
  }: CampaignFindOneType): Promise<Campaign>;
}
