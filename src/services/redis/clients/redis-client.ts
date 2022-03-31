import { createClient } from 'redis';
import { Logger, OnModuleInit } from '@nestjs/common';
import { RedisClientInterface } from './interface';

export abstract class RedisClient
  implements OnModuleInit, RedisClientInterface
{
  private client;
  private readonly logger = new Logger(RedisClient.name);
  protected constructor(readonly url: string) {
    this.client = createClient({
      url,
    });
    this.client.on('error', (err) => console.log('Redis Client Error', err));
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async get(key: string): Promise<string | undefined> {
    try {
      return this.client.get(key);
    } catch (error) {
      this.logger.error(error.message());
    }
  }

  async set(key: string, value: string): Promise<string> {
    try {
      return this.client.set(key, value);
    } catch (error) {
      this.logger.error(error.message());
    }
  }

  async setex(key: string, expire: number, value: string): Promise<string> {
    try {
      return this.client.SETEX(key, expire, value);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
