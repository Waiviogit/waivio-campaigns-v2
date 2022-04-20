import { Inject, Injectable } from '@nestjs/common';

import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { CAMPAIGN_PROVIDE } from '../../common/constants';
import { CampaignHelperInterface } from './interface';
import { UpdateCampaignInterface } from './interface';
import {
  CampaignDocumentType,
  UpdateCampaignType,
} from '../../persistance/campaign/types';

@Injectable()
export class UpdateCampaign implements UpdateCampaignInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async update(campaign: UpdateCampaignType): Promise<CampaignDocumentType> {
    if (campaign.reward) {
      campaign.rewardInUSD = await this.campaignHelper.getRewardInUSD(
        campaign.currency,
        campaign.reward,
      );
    }
    const updatedCampaign = await this.campaignRepository.updateCampaign(
      campaign,
    );
    if (updatedCampaign) {
      await this.campaignHelper.setExpireTTLCampaign(
        updatedCampaign.expiredAt,
        updatedCampaign._id,
      );
    }
    return updatedCampaign;
  }
}
