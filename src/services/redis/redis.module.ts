import { Global, Module } from '@nestjs/common';

import { RedisBlockClient } from './block-client';

@Global()
@Module({
  providers: [RedisBlockClient],
  exports: [RedisBlockClient],
})
export class RedisClientModule {}
