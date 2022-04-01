import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignDocumentType } from './campaign.schema';
import { CampaignRepositoryInterface } from './interface';
import { CreateCampaignDto } from '../../common/dto/in';
import {
  CampaignFindOneAndDeleteType,
  CampaignFindOneType,
  CampaignUpdateOneType,
} from './types';

@Injectable()
export class CampaignRepository implements CampaignRepositoryInterface {
  private readonly logger = new Logger(CampaignRepository.name);
  constructor(
    @InjectModel(Campaign.name)
    private readonly model: Model<CampaignDocumentType>,
  ) {}

  async create(campaign: CreateCampaignDto): Promise<Campaign> {
    try {
      return await this.model.create(campaign);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOne({
    filter,
    projection,
    options,
  }: CampaignFindOneType): Promise<Campaign> {
    try {
      return this.model.findOne(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
  async findOneAndUpdate({
    filter,
    update,
    options,
  }: CampaignUpdateOneType): Promise<Campaign> {
    try {
      return this.model.findOneAndUpdate(filter, update, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOneAndDelete({
    filter,
    options,
  }: CampaignFindOneAndDeleteType): Promise<Campaign> {
    try {
      return this.model.findOneAndDelete(filter, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
