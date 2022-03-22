import { RedisClient } from './redis-client';

export class BlockClient extends RedisClient {
  constructor() {
    super('redis://localhost:6379/2');
  }
}
