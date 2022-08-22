import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Aggregate, Model, UpdateWriteOpResult } from 'mongoose';
import { CampaignPayment } from './campaign-payment.schema';
import {
  CampaignPaymentDocumentType,
  CreateCampaignPaymentType,
} from './types';
import {
  CampaignPaymentRepositoryInterface,
  CampaignPaymentUpdateInterface,
} from './interface';
import { AggregateType } from '../campaign/types';

@Injectable()
export class CampaignPaymentRepository
  implements CampaignPaymentRepositoryInterface
{
  private readonly logger = new Logger(CampaignPaymentRepository.name);
  constructor(
    @InjectModel(CampaignPayment.name)
    private readonly model: Model<CampaignPaymentDocumentType>,
  ) {}

  async create(
    campaign: CreateCampaignPaymentType,
  ): Promise<CampaignPaymentDocumentType> {
    try {
      return await this.model.create(campaign);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async aggregate({
    pipeline,
  }: AggregateType): Promise<Aggregate<Array<never>>> {
    try {
      return this.model.aggregate(pipeline);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async updateOne({
    filter,
    update,
    options,
  }: CampaignPaymentUpdateInterface): Promise<UpdateWriteOpResult> {
    try {
      return this.model.updateOne(filter, update, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
