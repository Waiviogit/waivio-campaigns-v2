import { Module } from '@nestjs/common';

import { BlockProcessor } from './block-processor';
import { TestRepositoryModule } from '../../persistance/test/test-repository.module';
import { HiveParserModule } from '../hive-parser/hive-parser.module';

@Module({
  imports: [TestRepositoryModule, HiveParserModule],
  providers: [BlockProcessor],
})
export class BlockProcessorModule {}
