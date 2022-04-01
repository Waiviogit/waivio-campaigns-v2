import { Inject, Injectable } from '@nestjs/common';

import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  REDIS_KEY,
} from '../../common/constants';
import { Campaign } from '../../persistance/campaign/campaign.schema';
import { CampaignHelperInterface } from './interface/campaign-helper.interface';
import { DeleteCampaignDto } from '../../common/dto/in';
import { DeleteCampaignInterface } from './interface/delete-campaign.interface';

@Injectable()
export class DeleteCampaign implements DeleteCampaignInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async delete({ _id }: DeleteCampaignDto): Promise<Campaign> {
    const filter = { _id, status: CAMPAIGN_STATUS.PENDING };

    const deleted = await this.campaignRepository.findOneAndDelete({
      filter,
    });
    if (deleted) {
      await this.campaignHelper.deleteCampaignKey(
        `${REDIS_KEY.CAMPAIGN_EXPIRE}${_id}`,
      );
    }
    return deleted;
  }
}
