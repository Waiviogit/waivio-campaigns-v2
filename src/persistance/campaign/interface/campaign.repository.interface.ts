import {
  ActivateCampaignType,
  AggregateType,
  CampaignDocumentType,
  CampaignFindOneAndDeleteType,
  CampaignFindType,
  CampaignUpdateType,
  CreateCampaignType,
  DeleteCampaignType,
  findCampaignByStatusGuideNameActivation,
  UpdateCampaignType,
} from '../types';
import { Aggregate, UpdateWriteOpResult } from 'mongoose';

export interface CampaignRepositoryInterface {
  create(campaign: CreateCampaignType): Promise<CampaignDocumentType>;
  find({
    filter,
    projection,
    options,
  }: CampaignFindType): Promise<CampaignDocumentType[]>;
  findOne({
    filter,
    projection,
    options,
  }: CampaignFindType): Promise<CampaignDocumentType>;
  findOneAndUpdate({
    filter,
    update,
    options,
  }: CampaignUpdateType): Promise<CampaignDocumentType>;
  findOneAndDelete({
    filter,
    options,
  }: CampaignFindOneAndDeleteType): Promise<CampaignDocumentType>;
  updateOne({
    filter,
    update,
    options,
  }: CampaignUpdateType): Promise<UpdateWriteOpResult>;
  aggregate({ pipeline }: AggregateType): Promise<Aggregate<Array<never>>>;
  updateMany({
    filter,
    update,
    options,
  }: CampaignUpdateType): Promise<UpdateWriteOpResult>;
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
  findOnePending(_id: string, guideName: string): Promise<CampaignDocumentType>;
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
