import { Module } from '@nestjs/common';

import { BlockProcessorModule } from './processor/block-processor.module';
import { CampaignModule } from './campaign/campaign.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WobjectModule } from './wobject/wobject.module';
import { CampaignPaymentModule } from './campaign-payment/campaign-payment.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    BlockProcessorModule,
    CampaignModule,
    NotificationsModule,
    WobjectModule,
    CampaignPaymentModule,
    JobsModule,
  ],
  exports: [
    CampaignModule,
    NotificationsModule,
    WobjectModule,
    CampaignPaymentModule,
  ],
})
export class DomainModule {}
