import { Module } from '@nestjs/common';

import {
  EngineCommentsParserProvider,
  EngineMainParserProvider,
  EngineTransferParserProvider,
} from './engine-parser.provider';
import { CampaignModule } from '../campaign/campaign.module';
import { SponsorsBotModule } from '../sponsors-bot/sponsors-bot.module';

@Module({
  imports: [CampaignModule, SponsorsBotModule],
  providers: [
    EngineMainParserProvider,
    EngineTransferParserProvider,
    EngineCommentsParserProvider,
  ],
  exports: [EngineMainParserProvider],
})
export class EngineParserModule {}
