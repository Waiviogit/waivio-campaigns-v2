import {
  ActivateCampaignType,
  CampaignDocumentType,
  CampaignFindOneAndDeleteType,
  CampaignFindOneType,
  CampaignUpdateOneType,
  CreateCampaignType,
  DeleteCampaignType,
  UpdateCampaignType,
} from '../types';

export interface CampaignRepositoryInterface {
  create(campaign: CreateCampaignType): Promise<CampaignDocumentType>;
  findOne({
    filter,
    projection,
    options,
  }: CampaignFindOneType): Promise<CampaignDocumentType>;
  findOneAndUpdate({
    filter,
    update,
    options,
  }: CampaignUpdateOneType): Promise<CampaignDocumentType>;
  findOneAndDelete({
    filter,
    options,
  }: CampaignFindOneAndDeleteType): Promise<CampaignDocumentType>;
  /*
Domain
 */
  findOneSuspended(guideName: string): Promise<CampaignDocumentType>;
  findActiveByActivationLink(
    activation_permlink: string,
  ): Promise<CampaignDocumentType>;
  activateCampaign({
    _id,
    status,
    guideName,
    permlink,
  }: ActivateCampaignType): Promise<CampaignDocumentType>;
  findOnePending(guideName: string, _id: string): Promise<CampaignDocumentType>;
  findCampaignById(_id: string): Promise<CampaignDocumentType>;
  updateCampaign(campaign: UpdateCampaignType): Promise<CampaignDocumentType>;
  deleteCampaignById({
    _id,
  }: DeleteCampaignType): Promise<CampaignDocumentType>;
}
