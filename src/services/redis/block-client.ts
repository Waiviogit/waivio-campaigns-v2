import { RedisClient } from './redis-client';

export class RedisBlockClient extends RedisClient {
  constructor() {
    super('redis://localhost:6379/2');
  }
}
