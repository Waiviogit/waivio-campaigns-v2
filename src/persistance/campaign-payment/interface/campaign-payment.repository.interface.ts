import { CampaignPaymentDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export type CampaignPaymentRepositoryInterface =
  MongoRepositoryInterface<CampaignPaymentDocumentType>;
