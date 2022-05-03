import { Module } from '@nestjs/common';

import {
  EngineMainParserProvider,
  EngineTransferParserProvider,
} from './engine-parser.provider';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [CampaignModule],
  providers: [EngineMainParserProvider, EngineTransferParserProvider],
  exports: [EngineMainParserProvider, EngineTransferParserProvider],
})
export class EngineParserModule {}
