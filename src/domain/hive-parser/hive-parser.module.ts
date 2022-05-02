import { Module } from '@nestjs/common';
import {
  HiveCommentParserProvider,
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
  ],
  exports: [
    HiveMainParserProvider,
    HiveCommentParserProvider,
    HiveTransferParserProvider,
  ],
})
export class HiveParserModule {}
