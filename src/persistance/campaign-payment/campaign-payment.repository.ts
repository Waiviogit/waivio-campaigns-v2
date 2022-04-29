import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CampaignPayment } from './campaign-payment.schema';
import { CampaignPaymentDocumentType } from './types';

@Injectable()
export class CampaignPaymentRepository {
  private readonly logger = new Logger(CampaignPaymentRepository.name);
  constructor(
    @InjectModel(CampaignPayment.name)
    private readonly model: Model<CampaignPaymentDocumentType>,
  ) {}
}
