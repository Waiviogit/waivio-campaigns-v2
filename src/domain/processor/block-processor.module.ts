import { Module } from '@nestjs/common';

import { HiveProcessor } from './hive-processor';
import { HiveParserModule } from '../hive-parser/hive-parser.module';
import { EngineParserModule } from '../engine-parser/engine-parser.module';
import { EngineProcessor } from './engine-processor';

@Module({
  imports: [HiveParserModule, EngineParserModule],
  providers: [HiveProcessor, EngineProcessor],
})
export class BlockProcessorModule {}
