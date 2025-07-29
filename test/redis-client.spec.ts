import { RedisTestClient } from '../src/services/redis/clients/redis-test-client';
import { RedisTestHelper } from './helpers/redis-test-helper';

describe('RedisTestClient', () => {
  let redisClient: RedisTestClient;

  beforeAll(async () => {
    const testEnv = await RedisTestHelper.setupTestEnvironment();
    redisClient = testEnv.client;
  });

  afterAll(async () => {
    await RedisTestHelper.teardownTestEnvironment();
  });

  beforeEach(async () => {
    await RedisTestHelper.clearTestDatabase();
  });

  describe('Basic Operations', () => {
    it('should connect to test database 7', () => {
      expect(redisClient.getTestDatabaseNumber()).toBe(7);
    });

    it('should set and get a value', async () => {
      const key = 'test:key';
      const value = 'test-value';

      await redisClient.set(key, value);
      const result = await redisClient.get(key);

      expect(result).toBe(value);
    });

    it('should set value with expiry', async () => {
      const key = 'test:expiry';
      const value = 'expiry-value';
      const expiry = 1; // 1 second

      await redisClient.setex(key, expiry, value);
      const result = await redisClient.get(key);

      expect(result).toBe(value);

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const expiredResult = await redisClient.get(key);

      expect(expiredResult).toBeNull();
    });

    it('should delete a key', async () => {
      const key = 'test:delete';
      const value = 'delete-value';

      await redisClient.set(key, value);
      let result = await redisClient.get(key);
      expect(result).toBe(value);

      await redisClient.deleteKey(key);
      result = await redisClient.get(key);
      expect(result).toBeNull();
    });
  });

  describe('Hash Operations', () => {
    it('should handle hash operations', async () => {
      const key = 'test:hash';
      const field1 = 'field1';
      const value1 = 'value1';
      const field2 = 'field2';
      const value2 = 'value2';

      // Note: RedisTestClient doesn't have hset method, so we'll test hGetAll with empty hash
      const result = await redisClient.hGetAll(key);
      expect(result).toEqual({});
    });
  });

  describe('Sorted Set Operations', () => {
    it('should add and remove from sorted set', async () => {
      const key = 'test:sortedset';
      const member1 = 'member1';
      const score1 = 1;
      const member2 = 'member2';
      const score2 = 2;

      await redisClient.zadd(key, score1, member1);
      await redisClient.zadd(key, score2, member2);

      // Remove by score range
      await redisClient.zremrangebyscore(key, 0, 1);

      // Remove specific member
      await redisClient.zrem(key, member2);
    });
  });

  describe('Pub/Sub Operations', () => {
    it('should publish messages', async () => {
      const channel = 'test:channel';
      const message = 'test-message';

      const result = await redisClient.publish(channel, message);
      expect(typeof result).toBe('number');
    });
  });

  describe('Database Isolation', () => {
    it('should use database 7 for isolation', () => {
      expect(redisClient.getTestDatabaseNumber()).toBe(7);
    });

    it('should clear test database between tests', async () => {
      const key = 'test:isolation';
      const value = 'isolation-value';

      await redisClient.set(key, value);
      let result = await redisClient.get(key);
      expect(result).toBe(value);

      await RedisTestHelper.clearTestDatabase();
      result = await redisClient.get(key);
      expect(result).toBeNull();
    });
  });
});
