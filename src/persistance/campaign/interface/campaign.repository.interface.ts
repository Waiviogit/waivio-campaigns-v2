import { CreateCampaignDto } from '../../../common/dto/in';
import { Campaign } from '../campaign.schema';
import {
  CampaignFindOneAndDeleteType,
  CampaignFindOneType,
  CampaignUpdateOneType,
} from '../types';

export interface CampaignRepositoryInterface {
  create(campaign: CreateCampaignDto): Promise<Campaign>;
  findOne({
    filter,
    projection,
    options,
  }: CampaignFindOneType): Promise<Campaign>;
  findOneAndUpdate({
    filter,
    update,
    options,
  }: CampaignUpdateOneType): Promise<Campaign>;
  findOneAndDelete({
    filter,
    options,
  }: CampaignFindOneAndDeleteType): Promise<Campaign>;
}
