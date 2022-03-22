import { createClient } from 'redis';
import { OnModuleInit } from '@nestjs/common';

export class RedisClient implements OnModuleInit {
  constructor(readonly url: string) {
    this.url = url;
  }
  private client = createClient({
    url: this.url,
  });

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async get(key: string): Promise<string> {
    return this.client.get(key);
  }
}
