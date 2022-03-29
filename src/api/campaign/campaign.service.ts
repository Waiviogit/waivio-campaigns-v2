import { Injectable } from '@nestjs/common';
import { CreateCampaignDto } from '../../common/dto/in';

@Injectable()
export class CampaignService {
  constructor() {}

  async createCampaign(createCampaignDto: CreateCampaignDto) {
    console.log('created _________');
  }
}
