import { CreateCampaignDto } from '../../../common/dto/in';
import { Campaign } from '../campaign.schema';
import {
  ActivateCampaignType,
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
  /*
Domain
 */
  findOneSuspended(guideName: string): Promise<Campaign>;
  findActiveByActivationLink(activation_permlink: string): Promise<Campaign>;
  activateCampaign({
    _id,
    status,
    guideName,
    permlink,
  }: ActivateCampaignType): Promise<Campaign>;
  findOnePending(guideName: string, _id: string): Promise<Campaign>;
  findCampaignById(_id: string): Promise<Campaign>;
}
