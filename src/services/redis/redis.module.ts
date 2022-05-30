import { Global, Module } from '@nestjs/common';
import {
  RedisBlockProvider,
  RedisCampaignProvider,
} from './redis-client.provider';
import { RedisCampaignSubscriber } from './subscribers/campaign-subscriber';
import { SponsorsBotModule } from '../../domain/sponsors-bot/sponsors-bot.module';

@Global()
@Module({
  imports: [SponsorsBotModule],
  providers: [
    RedisBlockProvider,
    RedisCampaignProvider,
    RedisCampaignSubscriber,
  ],
  exports: [RedisBlockProvider, RedisCampaignProvider],
})
export class RedisClientModule {}
