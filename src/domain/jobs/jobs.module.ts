import { Module } from '@nestjs/common';

import { JobsService } from './jobs.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CampaignModule } from '../campaign/campaign.module';
import { SponsorsBotModule } from '../sponsors-bot/sponsors-bot.module';

@Module({
  imports: [ScheduleModule.forRoot(), CampaignModule, SponsorsBotModule],
  providers: [JobsService],
  exports: [],
})
export class JobsModule {}
