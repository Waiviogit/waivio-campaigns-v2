import { Module } from '@nestjs/common';

import { BlockProcessor } from './block-processor';
import { StartParser } from './start-parser';
import { TestRepositoryModule } from '../../persistance/test/test-repository.module';

@Module({
  imports: [TestRepositoryModule],
  providers: [BlockProcessor, StartParser],
})
export class BlockProcessorModule {}
