import { HttpException, Inject, Injectable } from '@nestjs/common';

import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_TYPE,
  REDIS_KEY,
} from '../../common/constants';
import { CampaignHelperInterface } from './interface';
import { UpdateCampaignInterface } from './interface';
import {
  CampaignDocumentType,
  UpdateCampaignType,
} from '../../persistance/campaign/types';
import { castToUTC } from '../../common/helpers';

@Injectable()
export class UpdateCampaign implements UpdateCampaignInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async update(campaign: UpdateCampaignType): Promise<CampaignDocumentType> {
    if (campaign.sponsorURL) {
      const isValidUrl = await this.campaignHelper.validateSponsorUrl(
        campaign.sponsorURL,
      );
      if (!isValidUrl)
        throw new HttpException(
          `Campaign is not created. sponsorURL doesn't match validation criteria `,
          422,
        );
    }

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
      await this.campaignHelper.setNextRecurrentEvent(
        updatedCampaign.recurrenceRule,
        updatedCampaign._id.toString(),
        REDIS_KEY.GIVEAWAY_OBJECT_RECURRENT,
      );
    }

    if (
      updatedCampaign.type === CAMPAIGN_TYPE.CONTESTS_OBJECT &&
      (campaign.timezone || campaign.expiredAt)
    ) {
      await this.campaignHelper.setNextRecurrentEvent(
        updatedCampaign.recurrenceRule,
        updatedCampaign._id.toString(),
        REDIS_KEY.CONTEST_OBJECT_RECURRENT,
      );
    }

    return updatedCampaign;
  }
}
