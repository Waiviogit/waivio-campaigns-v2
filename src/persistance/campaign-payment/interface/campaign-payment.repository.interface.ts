import {
  CampaignPaymentDocumentType,
  CreateCampaignPaymentType,
} from '../types';

export interface CampaignPaymentRepositoryInterface {
  create(
    campaign: CreateCampaignPaymentType,
  ): Promise<CampaignPaymentDocumentType>;
}
