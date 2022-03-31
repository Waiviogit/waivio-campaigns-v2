import { Provider } from '@nestjs/common';

import { REDIS_PROVIDE } from '../../common/constants';
import { RedisBlockClient } from './clients/block-client';
import { RedisCampaignClient } from './clients/campaign-client';

export const RedisBlockProvider: Provider = {
  provide: REDIS_PROVIDE.BLOCK_CLIENT,
  useClass: RedisBlockClient,
};

export const RedisCampaignProvider: Provider = {
  provide: REDIS_PROVIDE.CAMPAIGN_CLIENT,
  useClass: RedisCampaignClient,
};
