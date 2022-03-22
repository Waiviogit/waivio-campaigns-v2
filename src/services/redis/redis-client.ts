import { createClient } from 'redis';
import { OnModuleInit } from '@nestjs/common';

export abstract class RedisClient implements OnModuleInit {
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
  async connect(): Promise<void> {
    await this.client.connect();
  }

  async get(key: string): Promise<string> {
    return this.client.get(key);
  }
}
