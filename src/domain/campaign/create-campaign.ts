import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { BLACKLIST_PROVIDE, CAMPAIGN_PROVIDE } from '../../common/constants';
import { CreateCampaignInterface } from './interface';
import { CampaignHelperInterface } from './interface';
import {
  CampaignDocumentType,
  CreateCampaignType,
} from '../../persistance/campaign/types';
import { BlacklistHelperInterface } from '../blacklist/interface';

const MIN_CAMPAIGN_REWARD_USD = 0.5;

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

    if (rewardInUSD < MIN_CAMPAIGN_REWARD_USD) {
      throw new HttpException(
        `Campaign is not created. Reward should be more than $${MIN_CAMPAIGN_REWARD_USD}.`,
        422,
      );
    }

    if (campaign.reward > campaign.budget) {
      throw new HttpException(`Reward more than budget`, 422);
    }

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
