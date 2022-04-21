import {
  ActivateCampaignType,
  AggregateType,
  CampaignDocumentType,
  CampaignFindOneAndDeleteType,
  CampaignFindOneType,
  CampaignUpdateOneType,
  CreateCampaignType,
  DeleteCampaignType,
  findCampaignByStatusGuideNameActivation,
  UpdateCampaignType,
} from '../types';
import { Aggregate, UpdateWriteOpResult } from 'mongoose';

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
  aggregate({ pipeline }: AggregateType): Promise<Aggregate<Array<never>>>;
  /*
Domain
 */
  findOneSuspended(guideName: string): Promise<CampaignDocumentType>;
  findActiveByActivationLink(
    activationPermlink: string,
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
    activationPermlink,
  }: findCampaignByStatusGuideNameActivation): Promise<CampaignDocumentType>;
}
