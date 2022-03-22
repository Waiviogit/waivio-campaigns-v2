import { Global, Module } from '@nestjs/common';
import { BlockClient } from './block-client';


@Module({
  providers: [BlockClient],
  exports: [BlockClient],
})
export class RedisDbModule {}
