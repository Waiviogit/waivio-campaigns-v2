import { Provider } from '@nestjs/common';

import { REDIS_PROVIDE } from '../../common/constants';
import { RedisBlockClient } from './block-client';

export const RedisBlockProvider: Provider = {
  provide: REDIS_PROVIDE.BLOCK_CLIENT,
  useClass: RedisBlockClient,
};
