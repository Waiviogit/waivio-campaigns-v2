import {
  ActivateCampaignType,
  CampaignDocumentType,
  CampaignFindOneAndDeleteType,
  CampaignFindOneType,
  CampaignUpdateOneType,
  CreateCampaignType,
  DeleteCampaignType,
  findCampaignByStatusGuideNameActivation,
  UpdateCampaignType,
} from '../types';
import { UpdateWriteOpResult } from 'mongoose';

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
  updateOne({
    filter,
    update,
    options,
  }: CampaignUpdateOneType): Promise<UpdateWriteOpResult>;
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
  findCampaignByStatusGuideNameActivation({
    statuses,
    guideName,
    activation_permlink,
  }: findCampaignByStatusGuideNameActivation): Promise<CampaignDocumentType>;
}
