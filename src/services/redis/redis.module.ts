import { Global, Module } from '@nestjs/common';
import {
  RedisBlockProvider,
  RedisCampaignProvider,
} from './redis-client.provider';
import { RedisCampaignSubscriber } from './subscribers/campaign-subscriber';

@Global()
@Module({
  providers: [
    RedisBlockProvider,
    RedisCampaignProvider,
    RedisCampaignSubscriber,
  ],
  exports: [RedisBlockProvider, RedisCampaignProvider],
})
export class RedisClientModule {}
