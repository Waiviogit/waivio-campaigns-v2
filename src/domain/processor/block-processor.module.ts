import { Module } from '@nestjs/common';
import { BlockProcessor } from './block-processor';
import { RedisDbModule } from '../../services/redis/redis.module';
import {StartParser} from "./start-parser";

@Module({
  // imports: [RedisDbModule],
  providers: [BlockProcessor, StartParser],
})
export class BlockProcessorModule {}
