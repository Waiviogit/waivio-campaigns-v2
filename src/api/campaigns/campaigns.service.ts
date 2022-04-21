import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_PROVIDE } from '../../common/constants';
import { GuideCampaignsInterface } from '../../domain/campaign/interface';
import { GuideActiveCampaignType } from '../../domain/campaign/types';

@Injectable()
export class CampaignsService {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.CREATE_CAMPAIGN)
    private readonly guideCampaigns: GuideCampaignsInterface,
  ) {}
  async getActiveCampaigns(
    guideName: string,
  ): Promise<GuideActiveCampaignType[]> {
    return this.guideCampaigns.getActiveCampaigns(guideName);
  }
}
