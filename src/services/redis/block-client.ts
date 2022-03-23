import { RedisClient } from './redis-client';
import { configService } from '../../common/config';

export class RedisBlockClient extends RedisClient {
  constructor() {
    super(configService.getRedisBlocksConfig());
  }
}
