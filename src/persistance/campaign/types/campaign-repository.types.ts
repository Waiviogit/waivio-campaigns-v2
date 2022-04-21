import {
  FilterQuery,
  PipelineStage,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { CampaignDocumentType } from './campaign.types';
import { Campaign } from '../campaign.schema';

export type CampaignFindOneType = {
  filter: FilterQuery<CampaignDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};

export type CampaignUpdateOneType = {
  filter: FilterQuery<CampaignDocumentType>;
  update: UpdateWithAggregationPipeline | UpdateQuery<CampaignDocumentType>;
  options?: QueryOptions;
};

export type CampaignFindOneAndDeleteType = {
  filter: FilterQuery<CampaignDocumentType>;
  options?: QueryOptions;
};

export type ActivateCampaignType = {
  _id: string;
  guideName: string;
  status: string;
  permlink: string;
};

export type CreateCampaignType = Omit<
  Campaign,
  | '_id'
  | 'status'
  | 'campaignServer'
  | 'users'
  | 'activationPermlink'
  | 'deactivationPermlink'
  | 'payments'
  | 'stoppedAt'
  | 'canAssign'
>;

export type UpdateCampaignType = Partial<
  Omit<
    Campaign,
    | 'guideName'
    | 'status'
    | 'campaignServer'
    | 'users'
    | 'activationPermlink'
    | 'deactivationPermlink'
    | 'payments'
    | 'stoppedAt'
    | 'canAssign'
  >
>;

export type DeleteCampaignType = Pick<Campaign, '_id'>;

export type findCampaignByStatusGuideNameActivation = {
  statuses: string[];
  guideName: string;
  activationPermlink: string;
};

export type AggregateType = {
  pipeline: PipelineStage[];
  options?: unknown;
};
