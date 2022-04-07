import { Module } from '@nestjs/common';

import { BlockProcessorModule } from './processor/block-processor.module';
import { CampaignModule } from './campaign/campaign.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WobjectModule } from './wobject/wobject.module';

@Module({
  imports: [
    BlockProcessorModule,
    CampaignModule,
    NotificationsModule,
    WobjectModule,
  ],
  exports: [CampaignModule, NotificationsModule, WobjectModule],
})
export class DomainModule {}
