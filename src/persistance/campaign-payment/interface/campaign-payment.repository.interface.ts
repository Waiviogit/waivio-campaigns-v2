import {
  CampaignPaymentDocumentType,
  CreateCampaignPaymentType,
  DeleteResultType,
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

  deleteMany({
    filter,
    options,
  }: CampaignPaymentDeleteManyInterface): Promise<DeleteResultType>;
}

export interface CampaignPaymentUpdateInterface {
  filter: FilterQuery<CampaignPaymentDocumentType>;
  update:
    | UpdateWithAggregationPipeline
    | UpdateQuery<CampaignPaymentDocumentType>;
  options?: QueryOptions;
}

export interface CampaignPaymentDeleteManyInterface {
  filter: FilterQuery<CampaignPaymentDocumentType>;
  options?: QueryOptions;
}
