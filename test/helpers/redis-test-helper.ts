import { RedisTestClient } from '../../src/services/redis/clients/redis-test-client';
import { RedisTestSubscriber } from '../../src/services/redis/subscribers/redis-test-subscriber';

export class RedisTestHelper {
  private static redisClient: RedisTestClient;
  private static redisSubscriber: RedisTestSubscriber;

  static async initializeTestClient(
    redisUrl = 'redis://localhost:6379',
  ): Promise<RedisTestClient> {
    if (!this.redisClient) {
      this.redisClient = new RedisTestClient(redisUrl);
      await this.redisClient.onModuleInit();
    }
    return this.redisClient;
  }

  static async clearTestDatabase(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.clearTestDatabase();
    }
  }

  static async disconnectTestClient(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.disconnect();
      this.redisClient = null;
    }
  }

  static async initializeTestSubscriber(
    redisUrl = 'redis://localhost:6379',
  ): Promise<RedisTestSubscriber> {
    if (!this.redisSubscriber) {
      this.redisSubscriber = new RedisTestSubscriber(redisUrl);
      await this.redisSubscriber.onModuleInit();
    }
    return this.redisSubscriber;
  }

  static async disconnectTestSubscriber(): Promise<void> {
    if (this.redisSubscriber) {
      await this.redisSubscriber.disconnect();
      this.redisSubscriber = null;
    }
  }

  static getTestClient(): RedisTestClient {
    return this.redisClient;
  }

  static getTestSubscriber(): RedisTestSubscriber {
    return this.redisSubscriber;
  }

  static async setupTestEnvironment(
    redisUrl?: string,
  ): Promise<{ client: RedisTestClient; subscriber: RedisTestSubscriber }> {
    const client = await this.initializeTestClient(redisUrl);
    const subscriber = await this.initializeTestSubscriber(redisUrl);
    await this.clearTestDatabase();
    subscriber.clearReceivedMessages();
    subscriber.clearHandlers();
    return { client, subscriber };
  }

  static async teardownTestEnvironment(): Promise<void> {
    await this.clearTestDatabase();
    await this.disconnectTestClient();
    await this.disconnectTestSubscriber();
  }
}
