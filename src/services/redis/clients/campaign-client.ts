import { RedisClient } from './redis-client';
import { configService } from '../../../common/config';

export class RedisCampaignClient extends RedisClient {
  constructor() {
    super(configService.getRedisCampaignsConfig());
  }
}
