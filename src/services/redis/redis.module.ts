import { Global, Module } from '@nestjs/common';
import {
  RedisBlockProvider,
  RedisCampaignProvider,
} from './redis-client.provider';
import { RedisCampaignSubscriber } from './subscribers/campaign-subscriber';
import { SponsorsBotModule } from '../../domain/sponsors-bot/sponsors-bot.module';
import { CampaignModule } from '../../domain/campaign/campaign.module';

@Global()
@Module({
  imports: [SponsorsBotModule, CampaignModule],
  providers: [
    RedisBlockProvider,
    RedisCampaignProvider,
    RedisCampaignSubscriber,
  ],
  exports: [RedisBlockProvider, RedisCampaignProvider],
})
export class RedisClientModule {}
