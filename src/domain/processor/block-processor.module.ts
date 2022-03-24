import { Module } from '@nestjs/common';

import { BlockProcessor } from './block-processor';
import { HiveParserModule } from '../hive-parser/hive-parser.module';

@Module({
  imports: [HiveParserModule],
  providers: [BlockProcessor],
})
export class BlockProcessorModule {}
