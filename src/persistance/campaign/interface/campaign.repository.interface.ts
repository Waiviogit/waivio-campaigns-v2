import {
  ActivateCampaignType,
  CampaignDocumentType,
  CreateCampaignRepositoryType,
  DeleteCampaignType,
  findCampaignByStatusGuideNameActivation,
  UpdateCampaignType,
} from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export interface CampaignRepositoryInterface
  extends MongoRepositoryInterface<CampaignDocumentType, CreateCampaignRepositoryType> {
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
