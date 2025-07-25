import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';

import { Campaign } from './campaign.schema';
import { CampaignRepositoryInterface } from './interface';
import {
  ActivateCampaignType,
  CampaignDocumentType,
  DeleteCampaignType,
  findCampaignByStatusGuideNameActivation,
  UpdateCampaignType,
} from './types';
import { CAMPAIGN_STATUS } from '../../common/constants';
import { MongoRepository } from '../mongo.repository';

@Injectable()
export class CampaignRepository
  extends MongoRepository<CampaignDocumentType>
  implements CampaignRepositoryInterface
{
  constructor(
    @InjectModel(Campaign.name)
    protected readonly model: Model<CampaignDocumentType>,
  ) {
    super(model, new Logger(CampaignRepository.name));
  }

  async findOneSuspended(guideName: string): Promise<CampaignDocumentType> {
    return this.findOne({
      filter: { guideName, status: CAMPAIGN_STATUS.SUSPENDED },
    });
  }

  async findOnePending(
    _id: string,
    guideName: string,
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
