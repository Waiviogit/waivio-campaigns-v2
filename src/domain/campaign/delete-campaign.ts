import { Inject, Injectable } from '@nestjs/common';

import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { CAMPAIGN_PROVIDE, REDIS_KEY } from '../../common/constants';
import { CampaignHelperInterface } from './interface/campaign-helper.interface';

import { DeleteCampaignInterface } from './interface/delete-campaign.interface';
import {
  CampaignDocumentType,
  DeleteCampaignType,
} from '../../persistance/campaign/types';

@Injectable()
export class DeleteCampaign implements DeleteCampaignInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async delete({ _id }: DeleteCampaignType): Promise<CampaignDocumentType> {
    const deleted = await this.campaignRepository.deleteCampaignById({
      _id,
    });
    if (deleted) {
      await this.campaignHelper.deleteCampaignKey(
        `${REDIS_KEY.CAMPAIGN_EXPIRE}${_id}`,
      );
    }
    return deleted;
  }
}
