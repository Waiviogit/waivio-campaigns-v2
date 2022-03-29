import { Inject, Injectable } from '@nestjs/common';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { CAMPAIGN_PROVIDE } from '../../common/constants';
import { CreateCampaignDto } from '../../common/dto/in';
import { Campaign } from '../../persistance/campaign/campaign.schema';
import { CreateCampaignInterface } from './interface/create-campaign.interface';

@Injectable()
export class CreateCampaign implements CreateCampaignInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
  ) {}

  async create(campaign: CreateCampaignDto): Promise<Campaign> {
    return this.campaignRepository.create(campaign);
  }
}
