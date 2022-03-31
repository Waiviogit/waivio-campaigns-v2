import { Inject, Injectable } from '@nestjs/common';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { CAMPAIGN_PROVIDE } from '../../common/constants';
import { CreateCampaignDto } from '../../common/dto/in';
import { CreateCampaignInterface } from './interface/create-campaign.interface';
import { Campaign } from '../../persistance/campaign/campaign.schema';
import { CampaignHelperInterface } from './interface/campaign-helper.interface';

@Injectable()
export class CreateCampaign implements CreateCampaignInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async create(campaign: CreateCampaignDto): Promise<Campaign> {
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
