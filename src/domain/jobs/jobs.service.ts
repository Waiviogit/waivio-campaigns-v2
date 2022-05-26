import { Inject, Injectable } from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';
import { CAMPAIGN_PROVIDE, SPONSORS_BOT_PROVIDE } from '../../common/constants';

import { CampaignSuspendInterface } from '../campaign/interface';
import { SponsorsBotInterface } from '../sponsors-bot/interface';

@Injectable()
export class JobsService {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.SUSPEND)
    private readonly campaignSuspend: CampaignSuspendInterface,
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async suspendedJob(): Promise<void> {
    return this.campaignSuspend.startJob();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async matchBotJob(): Promise<void> {
    return this.sponsorsBot.executeUpvotes();
  }
}
