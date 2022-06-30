import { Module } from '@nestjs/common';

import { BlockProcessorModule } from './processor/block-processor.module';
import { CampaignModule } from './campaign/campaign.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WobjectModule } from './wobject/wobject.module';
import { CampaignPaymentModule } from './campaign-payment/campaign-payment.module';
import { JobsModule } from './jobs/jobs.module';
import { SponsorsBotModule } from './sponsors-bot/sponsors-bot.module';
import { BlacklistModule } from './blacklist/blacklist.module';

@Module({
  imports: [
    BlacklistModule,
    BlockProcessorModule,
    CampaignModule,
    NotificationsModule,
    WobjectModule,
    CampaignPaymentModule,
    JobsModule,
    SponsorsBotModule,
  ],
  exports: [
    BlacklistModule,
    CampaignModule,
    NotificationsModule,
    WobjectModule,
    CampaignPaymentModule,
    SponsorsBotModule,
  ],
})
export class DomainModule {}
