import { Inject, Injectable } from '@nestjs/common';

import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_TYPE,
  REWARDS_PROVIDE,
} from '../../common/constants';
import { CampaignHelperInterface } from './interface';
import { UpdateCampaignInterface } from './interface';
import {
  CampaignDocumentType,
  UpdateCampaignType,
} from '../../persistance/campaign/types';
import { castToUTC } from '../../common/helpers';
import { GiveawayObjectInterface } from './rewards/interface/giveaway-object.interface';
import { ContestInterface } from './rewards/interface';

@Injectable()
export class UpdateCampaign implements UpdateCampaignInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
    @Inject(REWARDS_PROVIDE.GIVEAWAY_OBJECT)
    private readonly giveawayObject: GiveawayObjectInterface,
    @Inject(REWARDS_PROVIDE.CONTEST_OBJECT)
    private readonly contest: ContestInterface,
  ) {}

  async update(campaign: UpdateCampaignType): Promise<CampaignDocumentType> {
    if (campaign.reward) {
      campaign.rewardInUSD = await this.campaignHelper.getCurrencyInUSD(
        campaign.currency,
        campaign.reward,
      );
    }

    // Handle contest rewards if they exist in the update
    if (campaign.contestRewards && campaign.contestRewards.length > 0) {
      const contestRewardsWithUSD = await Promise.all(
        campaign.contestRewards.map(async (reward) => ({
          ...reward,
          rewardInUSD: await this.campaignHelper.getCurrencyInUSD(
            campaign.currency,
            reward.reward,
          ),
        })),
      );
      campaign.contestRewards = contestRewardsWithUSD;
    }

    const updatedCampaign = await this.campaignRepository.updateCampaign({
      ...campaign,
      ...(campaign.expiredAt && {
        stoppedAt: castToUTC({
          date: campaign.expiredAt,
          timezone: campaign.timezone,
        }),
        expiredAt: castToUTC({
          date: campaign.expiredAt,
          timezone: campaign.timezone,
        }),
      }),
    });

    if (updatedCampaign) {
      await this.campaignHelper.setExpireTTLCampaign(
        updatedCampaign.expiredAt,
        updatedCampaign._id,
      );
    }

    if (
      updatedCampaign.type === CAMPAIGN_TYPE.GIVEAWAYS_OBJECT &&
      (campaign.timezone || campaign.expiredAt)
    ) {
      await this.giveawayObject.setNextRecurrentEvent(
        updatedCampaign.recurrenceRule,
        updatedCampaign._id.toString(),
        updatedCampaign.timezone,
      );
    }

    if (
      updatedCampaign.type === CAMPAIGN_TYPE.CONTESTS_OBJECT &&
      (campaign.timezone || campaign.expiredAt)
    ) {
      await this.contest.setNextRecurrentEvent(
        updatedCampaign.recurrenceRule,
        updatedCampaign._id.toString(),
        updatedCampaign.timezone,
      );
    }

    return updatedCampaign;
  }
}
