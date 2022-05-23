import { Module } from '@nestjs/common';
import {
  HiveCommentParserProvider,
  HiveJsonParserProvider,
  HiveMainParserProvider,
  HiveTransferParserProvider,
} from './hive-parser.provider';
import { CampaignModule } from '../campaign/campaign.module';
import { SponsorsBotModule } from '../sponsors-bot/sponsors-bot.module';

@Module({
  imports: [CampaignModule, SponsorsBotModule],
  providers: [
    HiveMainParserProvider,
    HiveCommentParserProvider,
    HiveTransferParserProvider,
    HiveJsonParserProvider,
  ],
  exports: [HiveMainParserProvider],
})
export class HiveParserModule {}
