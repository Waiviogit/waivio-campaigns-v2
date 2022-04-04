import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign } from './campaign.schema';
import { CampaignRepositoryInterface } from './interface';
import { CreateCampaignDto } from '../../common/dto/in';
import {
  ActivateCampaignType,
  CampaignDocumentType,
  CampaignFindOneAndDeleteType,
  CampaignFindOneType,
  CampaignUpdateOneType,
} from './types';
import { CAMPAIGN_STATUS } from '../../common/constants';

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

  /*
  Domain
   */

  async findOneSuspended(guideName: string): Promise<Campaign> {
    return this.findOne({
      filter: { guideName, status: CAMPAIGN_STATUS.SUSPENDED },
    });
  }

  async findOnePending(guideName: string, _id: string): Promise<Campaign> {
    return this.findOne({
      filter: { _id, status: CAMPAIGN_STATUS.PENDING, guideName },
    });
  }

  async findActiveByActivationLink(
    activation_permlink: string,
  ): Promise<Campaign> {
    return this.findOne({
      filter: {
        activation_permlink,
        status: CAMPAIGN_STATUS.ACTIVE,
      },
    });
  }

  async activateCampaign({
    _id,
    status,
    guideName,
    permlink,
  }: ActivateCampaignType): Promise<Campaign> {
    return this.findOneAndUpdate({
      filter: { _id, status: CAMPAIGN_STATUS.PENDING, guideName },
      update: { status, activation_permlink: permlink },
      options: { new: true },
    });
  }
}
