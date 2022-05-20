import { Module } from '@nestjs/common';
import {
  HiveCommentParserProvider,
  HiveJsonParserProvider,
  HiveMainParserProvider,
  HiveTransferParserProvider,
} from './hive-parser.provider';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [CampaignModule],
  providers: [
    HiveMainParserProvider,
    HiveCommentParserProvider,
    HiveTransferParserProvider,
    HiveJsonParserProvider,
  ],
  exports: [HiveMainParserProvider],
})
export class HiveParserModule {}
