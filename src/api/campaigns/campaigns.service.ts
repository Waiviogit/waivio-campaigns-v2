import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_PROVIDE } from '../../common/constants';
import { GuideCampaignsInterface } from '../../domain/campaign/interface';
import {
  GuideManageCampaignType,
  GuideBalanceType,
  getInactiveCampaignsType,
  InactiveCampaignsType,
} from '../../domain/campaign/types';

@Injectable()
export class CampaignsService {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.GUIDE_CAMPAIGNS)
    private readonly guideCampaigns: GuideCampaignsInterface,
  ) {}
  async getActiveCampaigns(
    guideName: string,
  ): Promise<GuideManageCampaignType[]> {
    return this.guideCampaigns.getActiveCampaigns(guideName);
  }

  async getBalance(guideName: string): Promise<GuideBalanceType> {
    return this.guideCampaigns.getBalance(guideName);
  }

  async getHistory(
    req: getInactiveCampaignsType,
  ): Promise<InactiveCampaignsType> {
    return this.guideCampaigns.getInactiveCampaigns(req);
  }
}
