import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import {
  BLACKLIST_PROVIDE,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_TYPE,
  REDIS_KEY,
} from '../../common/constants';
import { CreateCampaignInterface } from './interface';
import { CampaignHelperInterface } from './interface';
import {
  CampaignDocumentType,
  CreateCampaignType,
} from '../../persistance/campaign/types';
import { BlacklistHelperInterface } from '../blacklist/interface';
import { castToUTC } from '../../common/helpers';

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

    const rewardInUSD = await this.campaignHelper.getCurrencyInUSD(
      campaign.currency,
      campaign.reward,
    );

    // For contests, calculate rewardInUSD for each contest reward
    let contestRewardsWithUSD: Array<{
      place: number;
      reward: number;
      rewardInUSD: number;
    }> = [];

    if (campaign.type === CAMPAIGN_TYPE.CONTESTS_OBJECT) {
      contestRewardsWithUSD = await Promise.all(
        campaign.contestRewards?.map(async (reward) => ({
          ...reward,
          rewardInUSD: await this.campaignHelper.getCurrencyInUSD(
            campaign.currency,
            reward.reward,
          ),
        })) || [],
      );

      const totalRewards = contestRewardsWithUSD.reduce(
        (sum, reward) => sum + reward.reward,
        0,
      );
      if (totalRewards > campaign.budget) {
        throw new HttpException(
          `Total contest rewards ($${totalRewards.toFixed(
            2,
          )}) exceed budget ($${campaign.budget})`,
          422,
        );
      }

      // Update campaign with calculated rewardInUSD values
      campaign.contestRewards = contestRewardsWithUSD;
    }

    // Validate minimum reward based on campaign type and environment
    const rewardValidation = this.campaignHelper.validateMinReward({
      type: campaign.type,
      rewardInUSD,
      contestRewards: contestRewardsWithUSD,
    });

    if (!rewardValidation.isValid) {
      throw new HttpException(rewardValidation.errorMessage, 422);
    }

    const { blacklist, whitelist } = await this.blacklistHelper.getBlacklist(
      campaign.guideName,
    );

    const utcEndDate = castToUTC({
      date: campaign.expiredAt,
      timezone: campaign.timezone,
    });

    const createdCampaign = await this.campaignRepository.create({
      ...campaign,
      rewardInUSD,
      blacklistUsers: blacklist,
      whitelistUsers: whitelist,
      stoppedAt: utcEndDate,
      expiredAt: utcEndDate,
    });

    if (createdCampaign) {
      await this.campaignHelper.setExpireTTLCampaign(
        createdCampaign.expiredAt,
        createdCampaign._id,
      );
      if (campaign.type === CAMPAIGN_TYPE.GIVEAWAYS_OBJECT) {
        await this.campaignHelper.setNextRecurrentEvent(
          campaign.recurrenceRule,
          createdCampaign._id.toString(),
          REDIS_KEY.GIVEAWAY_OBJECT_RECURRENT,
        );
      }
      if (campaign.type === CAMPAIGN_TYPE.CONTESTS_OBJECT) {
        await this.campaignHelper.setNextRecurrentEvent(
          campaign.recurrenceRule,
          createdCampaign._id.toString(),
          REDIS_KEY.CONTEST_OBJECT_RECURRENT,
        );
      }
    }
    return createdCampaign;
  }
}
