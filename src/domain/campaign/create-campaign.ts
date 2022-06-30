import { Inject, Injectable } from '@nestjs/common';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { BLACKLIST_PROVIDE, CAMPAIGN_PROVIDE } from '../../common/constants';
import { CreateCampaignInterface } from './interface';
import { CampaignHelperInterface } from './interface';
import {
  CampaignDocumentType,
  CreateCampaignType,
} from '../../persistance/campaign/types';
import { BlacklistHelperInterface } from '../blacklist/interface';

@Injectable()
export class CreateCampaign implements CreateCampaignInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(BLACKLIST_PROVIDE.HELPER)
    private readonly blacklistHelper: BlacklistHelperInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async create(
    campaign: Omit<CreateCampaignType, 'rewardInUSD'>,
  ): Promise<CampaignDocumentType> {
    const rewardInUSD = await this.campaignHelper.getCurrencyInUSD(
      campaign.currency,
      campaign.reward,
    );
    const { blacklist, whitelist } = await this.blacklistHelper.getBlacklist(
      campaign.guideName,
    );

    const createdCampaign = await this.campaignRepository.create({
      ...campaign,
      rewardInUSD,
      stoppedAt: campaign.expiredAt,
      blacklistUsers: blacklist,
      whitelistUsers: whitelist,
    });

    if (createdCampaign) {
      await this.campaignHelper.setExpireTTLCampaign(
        createdCampaign.expiredAt,
        createdCampaign._id,
      );
    }
    return createdCampaign;
  }
}
