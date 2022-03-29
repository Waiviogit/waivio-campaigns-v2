import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignDocumentType } from './campaign.schema';
import { CampaignRepositoryInterface } from './interface';
import { CreateCampaignDto } from '../../common/dto/in';

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
}
