import { Module } from '@nestjs/common';

import { BlockProcessorModule } from './processor/block-processor.module';
import { CampaignModule } from './campaign/campaign.module';

@Module({
  imports: [BlockProcessorModule, CampaignModule],
  exports: [CampaignModule],
})
export class DomainModule {}
