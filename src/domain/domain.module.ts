import { Module } from '@nestjs/common';

import { TestModule } from './test/test.module';
import { BlockProcessorModule } from './processor/block-processor.module';


@Module({
  imports: [
      TestModule,
    BlockProcessorModule
  ],
  exports: [TestModule],
})
export class DomainModule {}
