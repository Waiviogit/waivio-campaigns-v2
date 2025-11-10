import { Inject, Injectable } from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';
import { CAMPAIGN_PROVIDE, SPONSORS_BOT_PROVIDE } from '../../common/constants';

import {
  CampaignHelperInterface,
  CampaignSuspendInterface,
} from '../campaign/interface';
import { SponsorsBotInterface } from '../sponsors-bot/interface';

@Injectable()
export class JobsService {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.SUSPEND)
    private readonly campaignSuspend: CampaignSuspendInterface,
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async suspendedJob(): Promise<void> {
    return this.campaignSuspend.startJob();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async matchBotJob(): Promise<void> {
    await this.sponsorsBot.executeUpvotes();
    await this.sponsorsBot.executeBeneficiaryUpvotes();
  }

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async updateRewardJob(): Promise<void> {
    return this.campaignHelper.reCalcCampaignsRewardInUsd();
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async reachedLimitUpdateToActive(): Promise<void> {
    return this.campaignHelper.reachedLimitUpdateToActive();
  }
}
