import { Module } from '@nestjs/common';

import { BlockProcessor } from './block-processor';
import { TestRepositoryModule } from '../../persistance/test/test-repository.module';

@Module({
  imports: [TestRepositoryModule],
  providers: [BlockProcessor],
})
export class BlockProcessorModule {}
