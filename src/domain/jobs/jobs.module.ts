import { Module } from '@nestjs/common';

import { JobsService } from './jobs.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [ScheduleModule.forRoot(), CampaignModule],
  providers: [JobsService],
  exports: [],
})
export class JobsModule {}
