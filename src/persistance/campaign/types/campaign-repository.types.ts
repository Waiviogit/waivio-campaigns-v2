import {
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { CampaignDocumentType } from './campaign.types';

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
