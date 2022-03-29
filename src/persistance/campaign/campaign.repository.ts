import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignDocumentType } from './campaign.schema';
import { CampaignRepositoryInterface } from './interface';
import { CreateCampaignDto } from '../../common/dto/in';

@Injectable()
export class CampaignRepository implements CampaignRepositoryInterface {
  constructor(
    @InjectModel(Campaign.name)
    private readonly model: Model<CampaignDocumentType>,
  ) {}

  async create(campaign: CreateCampaignDto): Promise<Campaign> {
    try {
      return await new this.model(campaign).save();
    } catch (error) {
      console.log()
    }


  }
}
