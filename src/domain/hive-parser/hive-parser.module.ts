import { Module } from '@nestjs/common';
import {
  HiveAccUpdateParserProvider,
  HiveCommentParserProvider,
  HiveJsonParserProvider,
  HiveMainParserProvider,
  HiveTransferParserProvider,
} from './hive-parser.provider';
import { CampaignModule } from '../campaign/campaign.module';
import { SponsorsBotModule } from '../sponsors-bot/sponsors-bot.module';
import { BlacklistModule } from '../blacklist/blacklist.module';

@Module({
  imports: [CampaignModule, SponsorsBotModule, BlacklistModule],
  providers: [
    HiveMainParserProvider,
    HiveCommentParserProvider,
    HiveTransferParserProvider,
    HiveJsonParserProvider,
    HiveAccUpdateParserProvider,
  ],
  exports: [HiveMainParserProvider],
})
export class HiveParserModule {}
