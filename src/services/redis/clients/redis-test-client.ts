import { createClient } from 'redis';
import { Logger, OnModuleInit } from '@nestjs/common';
import { RedisClientInterface } from './interface';

export class RedisTestClient implements OnModuleInit, RedisClientInterface {
  private client;
  private readonly logger = new Logger(RedisTestClient.name);
  private readonly TEST_DB = 7;

  constructor(readonly url: string) {
    this.client = createClient({
      url,
      database: this.TEST_DB,
    });
    this.client.on('error', (err) =>
      this.logger.error('Redis Test Client Error', err),
    );
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.log(`Connected to Redis test database ${this.TEST_DB}`);
    } catch (error) {
      this.logger.error(
        `Failed to connect to Redis test database: ${error.message}`,
      );
      throw error;
    }
  }

  async get(key: string): Promise<string | undefined> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}: ${error.message}`);
      throw error;
    }
  }

  async set(key: string, value: string): Promise<string> {
    try {
      return await this.client.set(key, value);
    } catch (error) {
      this.logger.error(`Error setting key ${key}: ${error.message}`);
      throw error;
    }
  }

  async setex(key: string, expire: number, value: string): Promise<string> {
    try {
      return await this.client.SETEX(key, expire, value);
    } catch (error) {
      this.logger.error(
        `Error setting key ${key} with expiry: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteKey(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}: ${error.message}`);
      throw error;
    }
  }

  async hGetAll(key: string): Promise<object> {
    try {
      return await this.client.HGETALL(key);
    } catch (error) {
      this.logger.error(`Error getting hash ${key}: ${error.message}`);
      throw error;
    }
  }

  async publish(key: string, data: string): Promise<number> {
    try {
      return await this.client.PUBLISH(key, data);
    } catch (error) {
      this.logger.error(`Error publishing to ${key}: ${error.message}`);
      throw error;
    }
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return await this.client.sendCommand([
        'ZADD',
        key,
        String(score),
        member,
      ]);
    } catch (error) {
      this.logger.error(`Error adding to sorted set ${key}: ${error.message}`);
      throw error;
    }
  }

  async zremrangebyscore(
    key: string,
    min: number,
    max: number,
  ): Promise<number> {
    try {
      return await this.client.sendCommand([
        'ZREMRANGEBYSCORE',
        key,
        String(min),
        String(max),
      ]);
    } catch (error) {
      this.logger.error(
        `Error removing from sorted set ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async zrem(key: string, member: string): Promise<number> {
    try {
      return await this.client.sendCommand(['ZREM', key, member]);
    } catch (error) {
      this.logger.error(
        `Error removing member from sorted set ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  // Test-specific methods
  async clearTestDatabase(): Promise<void> {
    try {
      await this.client.flushDb();
      this.logger.log('Test database cleared');
    } catch (error) {
      this.logger.error(`Error clearing test database: ${error.message}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      this.logger.log('Redis test client disconnected');
    } catch (error) {
      this.logger.error(`Error disconnecting: ${error.message}`);
      throw error;
    }
  }

  getTestDatabaseNumber(): number {
    return this.TEST_DB;
  }
}
