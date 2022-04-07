import { Inject, Injectable } from '@nestjs/common';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { CAMPAIGN_PROVIDE } from '../../common/constants';
import { CreateCampaignInterface } from './interface/create-campaign.interface';
import { CampaignHelperInterface } from './interface/campaign-helper.interface';
import {
  CampaignDocumentType,
  CreateCampaignType,
} from '../../persistance/campaign/types';

@Injectable()
export class CreateCampaign implements CreateCampaignInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async create(campaign: CreateCampaignType): Promise<CampaignDocumentType> {
    const createdCampaign = await this.campaignRepository.create(campaign);
    if (createdCampaign) {
      await this.campaignHelper.setExpireTTLCampaign(
        createdCampaign.expiredAt,
        createdCampaign._id,
      );
    }
    return createdCampaign;
  }
}
