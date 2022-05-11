import { Inject, Injectable } from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';
import { CAMPAIGN_PROVIDE } from '../../common/constants';

import { CampaignSuspendInterface } from '../campaign/interface';

@Injectable()
export class JobsService {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.SUSPEND)
    private readonly campaignSuspend: CampaignSuspendInterface,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async suspendedJob(): Promise<void> {
    return this.campaignSuspend.startJob();
  }
}
