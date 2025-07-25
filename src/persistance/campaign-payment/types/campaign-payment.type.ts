import { CampaignPayment } from '../campaign-payment.schema';
import { Document } from 'mongoose';

export type CampaignPaymentBeneficiariesType = {
  account: string;
  weight: number;
};

export type CampaignPaymentDocumentType = CampaignPayment & Document;
