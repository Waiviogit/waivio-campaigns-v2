import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CampaignPayment } from './campaign-payment.schema';
import { CampaignPaymentDocumentType } from './types';
import { CampaignPaymentRepositoryInterface } from './interface';
import { MongoRepository } from '../mongo.repository';

@Injectable()
export class CampaignPaymentRepository
  extends MongoRepository<CampaignPaymentDocumentType>
  implements CampaignPaymentRepositoryInterface
{
  constructor(
    @InjectModel(CampaignPayment.name)
    protected readonly model: Model<CampaignPaymentDocumentType>,
  ) {
    super(model, new Logger(CampaignPaymentRepository.name));
  }
}
