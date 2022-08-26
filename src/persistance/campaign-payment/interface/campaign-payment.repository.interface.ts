import {
  CampaignPaymentDocumentType,
  CreateCampaignPaymentType,
} from '../types';
import { AggregateType } from '../../campaign/types';
import {
  Aggregate,
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from 'mongoose';

export interface CampaignPaymentRepositoryInterface {
  create(
    campaign: CreateCampaignPaymentType,
  ): Promise<CampaignPaymentDocumentType>;
  aggregate({ pipeline }: AggregateType): Promise<Aggregate<Array<never>>>;
  updateOne(
    params: CampaignPaymentUpdateInterface,
  ): Promise<UpdateWriteOpResult>;
}

export interface CampaignPaymentUpdateInterface {
  filter: FilterQuery<CampaignPaymentDocumentType>;
  update:
    | UpdateWithAggregationPipeline
    | UpdateQuery<CampaignPaymentDocumentType>;
  options?: QueryOptions;
}
