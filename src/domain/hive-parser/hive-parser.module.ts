import { Module } from '@nestjs/common';
import {
  HiveCommentParserProvider,
  HiveMainParserProvider,
} from './hive-parser.provider';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [CampaignModule],
  providers: [HiveMainParserProvider, HiveCommentParserProvider],
  exports: [HiveMainParserProvider, HiveCommentParserProvider],
})
export class HiveParserModule {}
