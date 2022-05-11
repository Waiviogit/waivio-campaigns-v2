import {
  CampaignPaymentDocumentType,
  CreateCampaignPaymentType,
} from '../types';
import { AggregateType } from '../../campaign/types';
import { Aggregate } from 'mongoose';

export interface CampaignPaymentRepositoryInterface {
  create(
    campaign: CreateCampaignPaymentType,
  ): Promise<CampaignPaymentDocumentType>;
  aggregate({ pipeline }: AggregateType): Promise<Aggregate<Array<never>>>;
}
