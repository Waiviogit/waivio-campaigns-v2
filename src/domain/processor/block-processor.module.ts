import { Module } from '@nestjs/common';
import { BlockProcessor } from './block-processor';

@Module({
  imports: [BlockProcessor],
})
export class BlockProcessorModule {}
