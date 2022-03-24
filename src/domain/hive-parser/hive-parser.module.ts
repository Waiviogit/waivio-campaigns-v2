import { Module } from '@nestjs/common';
import {
  HiveCommentParserProvider,
  HiveMainParserProvider,
} from './hive-parser.provider';

@Module({
  imports: [],
  providers: [HiveMainParserProvider, HiveCommentParserProvider],
  exports: [HiveMainParserProvider, HiveCommentParserProvider],
})
export class HiveParserModule {}
