import { Module } from '@nestjs/common';

import { BlockProcessorModule } from './processor/block-processor.module';
import { CampaignModule } from './campaign/campaign.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WobjectModule } from './wobject/wobject.module';
import { CampaignPaymentModule } from './campaign-payment/campaign-payment.module';
import { JobsModule } from './jobs/jobs.module';
import { SponsorsBotModule } from './sponsors-bot/sponsors-bot.module';
import { BlacklistModule } from './blacklist/blacklist.module';
import { CurrencyRatesModule } from './currency-rates/currency-rates.module';

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
    CurrencyRatesModule,
  ],
  exports: [
    BlacklistModule,
    CampaignModule,
    NotificationsModule,
    WobjectModule,
    CampaignPaymentModule,
    SponsorsBotModule,
    CurrencyRatesModule,
  ],
})
export class DomainModule {}
