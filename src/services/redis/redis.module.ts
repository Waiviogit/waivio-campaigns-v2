import { Module } from '@nestjs/common';
import { Redis } from './redis';

@Module({
  providers: [Redis],
})
export class RedisDbModule {}
