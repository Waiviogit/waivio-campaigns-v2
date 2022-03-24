import { Global, Module } from '@nestjs/common';
import { RedisBlockProvider } from './redis-client.provider';

@Global()
@Module({
  providers: [RedisBlockProvider],
  exports: [RedisBlockProvider],
})
export class RedisClientModule {}
