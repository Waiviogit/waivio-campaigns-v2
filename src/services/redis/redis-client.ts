import { createClient } from 'redis';
import { OnModuleInit } from '@nestjs/common';
import { RedisClientInterface } from './interface';

export abstract class RedisClient
  implements OnModuleInit, RedisClientInterface
{
  private client;
  protected constructor(readonly url: string) {
    this.client = createClient({
      url,
    });
    this.client.on('error', (err) => console.log('Redis Client Error', err));
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async get(key: string): Promise<string> {
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<string> {
    return this.client.set(key, value);
  }
}
