import { Module } from '@nestjs/common';

import { TestModule } from './test/test.module';
import { BlockProcessorModule } from './processor/block-processor.module';
import { CampaignModule } from './campaign/campaign.module';

@Module({
  imports: [TestModule, BlockProcessorModule, CampaignModule],
  exports: [CampaignModule, TestModule],
})
export class DomainModule {}
