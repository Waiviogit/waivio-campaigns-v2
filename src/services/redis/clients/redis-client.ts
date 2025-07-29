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

  async get(key: string): Promise<string | null> {
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
      return this.client.setEx(key, expire, value);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async deleteKey(key: string): Promise<number> {
    try {
      return this.client.del(key);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async hGetAll(key: string): Promise<object> {
    try {
      return this.client.HGETALL(key);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async publish(key: string, data: string): Promise<number> {
    try {
      return this.client.PUBLISH(key, data);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return this.client.sendCommand(['ZADD', key, String(score), member]);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async zremrangebyscore(
    key: string,
    min: number,
    max: number,
  ): Promise<number> {
    try {
      return this.client.sendCommand([
        'ZREMRANGEBYSCORE',
        key,
        String(min),
        String(max),
      ]);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async zrem(key: string, member: string): Promise<number> {
    try {
      return this.client.sendCommand(['ZREM', key, member]);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
