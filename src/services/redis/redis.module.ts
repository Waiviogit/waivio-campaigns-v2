import { Global, Module } from '@nestjs/common';
import { BlockClient } from './block-client';
import { RedisConnect } from './redisConnect';
@Global()
@Module({
  providers: [BlockClient],
  exports: [BlockClient],
})
export class RedisDbModule {}
