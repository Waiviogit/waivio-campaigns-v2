import { Module } from '@nestjs/common';
import { BlockProcessor } from './block-processor';
import { RedisDbModule } from '../../services/redis/redis.module';

@Module({
  imports: [RedisDbModule],
  providers: [BlockProcessor],
})
export class BlockProcessorModule {}
