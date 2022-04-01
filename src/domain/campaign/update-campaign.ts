import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { CAMPAIGN_PROVIDE, CAMPAIGN_STATUS } from '../../common/constants';
import { Campaign } from '../../persistance/campaign/campaign.schema';
import { CampaignHelperInterface } from './interface/campaign-helper.interface';
import { UpdateCampaignInterface } from './interface/update-campaign.interface';
import { UpdateCampaignDto } from '../../common/dto/in';

@Injectable()
export class UpdateCampaign implements UpdateCampaignInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async update(campaign: UpdateCampaignDto): Promise<Campaign> {
    const filter = { _id: campaign._id, status: CAMPAIGN_STATUS.PENDING };
    const update = _.omit(campaign, ['_id']);
    const options = { new: true };
    const updatedCampaign = await this.campaignRepository.findOneAndUpdate({
      filter,
      update,
      options,
    });
    if (updatedCampaign) {
      await this.campaignHelper.setExpireTTLCampaign(
        updatedCampaign.expiredAt,
        updatedCampaign._id,
      );
    }
    return updatedCampaign;
  }
}
