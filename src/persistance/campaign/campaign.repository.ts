import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Aggregate, Model, UpdateWriteOpResult } from 'mongoose';
import * as _ from 'lodash';

import { Campaign } from './campaign.schema';
import { CampaignRepositoryInterface } from './interface';
import {
  ActivateCampaignType,
  AggregateType,
  CampaignDocumentType,
  CampaignFindOneAndDeleteType,
  CampaignFindType,
  CampaignUpdateType,
  CreateCampaignType,
  DeleteCampaignType,
  findCampaignByStatusGuideNameActivation,
  UpdateCampaignType,
} from './types';
import { CAMPAIGN_STATUS } from '../../common/constants';

@Injectable()
export class CampaignRepository implements CampaignRepositoryInterface {
  private readonly logger = new Logger(CampaignRepository.name);
  constructor(
    @InjectModel(Campaign.name)
    private readonly model: Model<CampaignDocumentType>,
  ) {}

  async create(campaign: CreateCampaignType): Promise<CampaignDocumentType> {
    try {
      return await this.model.create(campaign);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async find({
    filter,
    projection,
    options,
  }: CampaignFindType): Promise<CampaignDocumentType[]> {
    try {
      return this.model.find(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOne({
    filter,
    projection,
    options,
  }: CampaignFindType): Promise<CampaignDocumentType> {
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
  }: CampaignUpdateType): Promise<CampaignDocumentType> {
    try {
      return this.model.findOneAndUpdate(filter, update, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOneAndDelete({
    filter,
    options,
  }: CampaignFindOneAndDeleteType): Promise<CampaignDocumentType> {
    try {
      return this.model.findOneAndDelete(filter, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
  async updateOne({
    filter,
    update,
    options,
  }: CampaignUpdateType): Promise<UpdateWriteOpResult> {
    try {
      return this.model.updateOne(filter, update, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async updateMany({
    filter,
    update,
    options,
  }: CampaignUpdateType): Promise<UpdateWriteOpResult> {
    try {
      return this.model.updateMany(filter, update, options);
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

  /*
  Domain
   */

  async findOneSuspended(guideName: string): Promise<CampaignDocumentType> {
    return this.findOne({
      filter: { guideName, status: CAMPAIGN_STATUS.SUSPENDED },
    });
  }

  async findOnePending(
    guideName: string,
    _id: string,
  ): Promise<CampaignDocumentType> {
    return this.findOne({
      filter: { _id, status: CAMPAIGN_STATUS.PENDING, guideName },
    });
  }

  async findActiveByActivationLink(
    activationPermlink: string,
  ): Promise<CampaignDocumentType> {
    return this.findOne({
      filter: {
        activationPermlink,
        status: CAMPAIGN_STATUS.ACTIVE,
      },
    });
  }

  async activateCampaign({
    _id,
    status,
    guideName,
    permlink,
  }: ActivateCampaignType): Promise<CampaignDocumentType> {
    return this.findOneAndUpdate({
      filter: { _id, status: CAMPAIGN_STATUS.PENDING, guideName },
      update: { status, activationPermlink: permlink },
      options: { new: true },
    });
  }

  async findCampaignById(_id: string): Promise<CampaignDocumentType> {
    return this.findOne({
      filter: { _id },
    });
  }

  async updateCampaign(
    campaign: UpdateCampaignType,
  ): Promise<CampaignDocumentType> {
    return this.findOneAndUpdate({
      filter: { _id: campaign._id, status: CAMPAIGN_STATUS.PENDING },
      update: _.omit(campaign, ['_id']),
      options: { new: true },
    });
  }

  async deleteCampaignById({
    _id,
  }: DeleteCampaignType): Promise<CampaignDocumentType> {
    return this.findOneAndDelete({
      filter: { _id, status: CAMPAIGN_STATUS.PENDING },
    });
  }

  async findCampaignByStatusGuideNameActivation({
    statuses,
    guideName,
    activationPermlink,
  }: findCampaignByStatusGuideNameActivation): Promise<CampaignDocumentType> {
    return this.findOne({
      filter: { guideName, activationPermlink, status: { $in: statuses } },
    });
  }
}
