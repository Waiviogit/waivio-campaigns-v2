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

    const campaignWithOneReward: string[] = [
      CAMPAIGN_TYPE.REVIEWS,
      CAMPAIGN_TYPE.MENTIONS,
      CAMPAIGN_TYPE.GIVEAWAYS,
      CAMPAIGN_TYPE.GIVEAWAYS_OBJECT,
    ];

    if (
      rewardInUSD < MIN_CAMPAIGN_REWARD_USD &&
      campaignWithOneReward.includes(campaign.type)
    ) {
      throw new HttpException(
        `Campaign is not created. Reward should be more than $${MIN_CAMPAIGN_REWARD_USD}.`,
        422,
      );
    }

    if (campaign.type === CAMPAIGN_TYPE.CONTESTS_OBJECT) {
      // For contests, calculate rewardInUSD for each contest reward and validate total
      const contestRewardsWithUSD = await Promise.all(
        campaign.contestRewards?.map(async (reward) => ({
          ...reward,
          rewardInUSD: await this.campaignHelper.getCurrencyInUSD(
            campaign.currency,
            reward.reward,
          ),
        })) || [],
      );

      const totalRewards = contestRewardsWithUSD.reduce(
        (sum, reward) => sum + reward.rewardInUSD,
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
