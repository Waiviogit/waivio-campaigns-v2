import { Module } from '@nestjs/common';

import { BlockProcessorModule } from './processor/block-processor.module';
import { CampaignModule } from './campaign/campaign.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [BlockProcessorModule, CampaignModule, NotificationsModule],
  exports: [CampaignModule, NotificationsModule],
})
export class DomainModule {}
