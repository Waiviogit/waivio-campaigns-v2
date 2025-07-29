import { RedisTestClient } from '../src/services/redis/clients/redis-test-client';
import { RedisTestSubscriber } from '../src/services/redis/subscribers/redis-test-subscriber';
import { RedisTestHelper } from './helpers/redis-test-helper';

describe('RedisTestSubscriber', () => {
  let redisClient: RedisTestClient;
  let redisSubscriber: RedisTestSubscriber;

  beforeAll(async () => {
    const testEnv = await RedisTestHelper.setupTestEnvironment();
    redisClient = testEnv.client;
    redisSubscriber = testEnv.subscriber;
  });

  afterAll(async () => {
    await RedisTestHelper.teardownTestEnvironment();
  });

  beforeEach(async () => {
    await RedisTestHelper.clearTestDatabase();
    redisSubscriber.clearReceivedMessages();
    redisSubscriber.clearHandlers();
  });

  describe('Basic Subscription', () => {
    it('should connect to test database 7', () => {
      expect(redisSubscriber.getTestDatabaseNumber()).toBe(7);
    });

    it('should subscribe to a channel and receive messages', async () => {
      const channel = 'test:channel';
      const message = 'test-message';
      let receivedMessage: string | null = null;

      // Subscribe to channel
      await redisSubscriber.subscribe(channel, async (ch, msg) => {
        receivedMessage = msg;
      });

      // Publish message
      await redisClient.publish(channel, message);

      // Wait for message
      const result = await redisSubscriber.waitForMessage(channel, 2000);

      expect(result).not.toBeNull();
      expect(result!.message).toBe(message);
      expect(result!.channel).toBe(channel);
      expect(receivedMessage).toBe(message);
    });

    it('should handle multiple messages on the same channel', async () => {
      const channel = 'test:multi';
      const messages = ['message1', 'message2', 'message3'];
      const receivedMessages: string[] = [];

      await redisSubscriber.subscribe(channel, async (ch, msg) => {
        receivedMessages.push(msg);
      });

      // Publish multiple messages
      for (const message of messages) {
        await redisClient.publish(channel, message);
      }

      // Wait for all messages
      const results = await redisSubscriber.waitForMessageCount(
        channel,
        3,
        3000,
      );

      expect(results).toHaveLength(3);
      expect(results.map((r) => r.message)).toEqual(messages);
      expect(receivedMessages).toEqual(messages);
    });

    it('should handle multiple subscribers on the same channel', async () => {
      const channel = 'test:multi-sub';
      const message = 'test-message';
      const handler1Messages: string[] = [];
      const handler2Messages: string[] = [];

      await redisSubscriber.subscribe(channel, async (ch, msg) => {
        handler1Messages.push(msg);
      });

      await redisSubscriber.subscribe(channel, async (ch, msg) => {
        handler2Messages.push(msg);
      });

      await redisClient.publish(channel, message);

      const result = await redisSubscriber.waitForMessage(channel, 2000);

      expect(result).not.toBeNull();
      expect(handler1Messages).toContain(message);
      expect(handler2Messages).toContain(message);
    });
  });

  describe('Channel Management', () => {
    it('should unsubscribe from a channel', async () => {
      const channel = 'test:unsub';
      const message = 'test-message';
      let messageReceived = false;

      await redisSubscriber.subscribe(channel, async (ch, msg) => {
        messageReceived = true;
      });

      await redisSubscriber.unsubscribe(channel);

      await redisClient.publish(channel, message);

      // Wait a bit to ensure no message is received
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(messageReceived).toBe(false);
    });

    it('should track received messages correctly', async () => {
      const channel1 = 'test:track1';
      const channel2 = 'test:track2';
      const message1 = 'message1';
      const message2 = 'message2';

      await redisSubscriber.subscribe(channel1);
      await redisSubscriber.subscribe(channel2);

      await redisClient.publish(channel1, message1);
      await redisClient.publish(channel2, message2);

      const allMessages = redisSubscriber.getReceivedMessages();
      const channel1Messages = redisSubscriber.getMessagesForChannel(channel1);
      const channel2Messages = redisSubscriber.getMessagesForChannel(channel2);

      expect(allMessages).toHaveLength(2);
      expect(channel1Messages).toHaveLength(1);
      expect(channel2Messages).toHaveLength(1);
      expect(channel1Messages[0].message).toBe(message1);
      expect(channel2Messages[0].message).toBe(message2);
    });
  });

  describe('Expired Events', () => {
    it('should subscribe to expired events', async () => {
      const key = 'test:expire:key';
      const value = 'test-value';
      let expiredKey: string | null = null;

      // Create a fresh subscriber for this test
      const testSubscriber = new RedisTestSubscriber('redis://localhost:6379');
      await testSubscriber.onModuleInit();

      await testSubscriber.subscribeToExpiredEvents(async (ch, msg) => {
        expiredKey = msg;
      });

      // Set a key with short expiry
      await redisClient.setex(key, 1, value);

      // Wait for expiry (give more time for the key to actually expire)
      const result = await testSubscriber.waitForMessage(
        `__keyevent@7__:expired`,
        5000,
      );

      expect(result).not.toBeNull();
      expect(result!.message).toBe(key);
      expect(expiredKey).toBe(key);

      await testSubscriber.disconnect();
    });

    it('should handle multiple expired events', async () => {
      const keys = [
        'test:expire:multi:1',
        'test:expire:multi:2',
        'test:expire:multi:3',
      ];
      const expiredKeys: string[] = [];

      // Create a fresh subscriber for this test
      const testSubscriber = new RedisTestSubscriber('redis://localhost:6379');
      await testSubscriber.onModuleInit();

      await testSubscriber.subscribeToExpiredEvents(async (ch, msg) => {
        expiredKeys.push(msg);
      });

      // Set keys with different expiry times
      await redisClient.setex(keys[0], 1, 'value1');
      await redisClient.setex(keys[1], 2, 'value2');
      await redisClient.setex(keys[2], 3, 'value3');

      // Wait for all expirations
      const results = await testSubscriber.waitForMessageCount(
        `__keyevent@7__:expired`,
        3,
        8000,
      );

      expect(results).toHaveLength(3);
      expect(expiredKeys).toHaveLength(3);
      expect(expiredKeys).toEqual(expect.arrayContaining(keys));

      await testSubscriber.disconnect();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in message handlers gracefully', async () => {
      const channel = 'test:error';
      const message = 'test-message';
      let handlerCalled = false;

      await redisSubscriber.subscribe(channel, async (ch, msg) => {
        handlerCalled = true;
        throw new Error('Handler error');
      });

      await redisClient.publish(channel, message);

      const result = await redisSubscriber.waitForMessage(channel, 2000);

      expect(result).not.toBeNull();
      expect(handlerCalled).toBe(true);
    });

    it('should continue processing other handlers when one fails', async () => {
      const channel = 'test:multi-error';
      const message = 'test-message';
      let handler1Called = false;
      let handler2Called = false;

      await redisSubscriber.subscribe(channel, async (ch, msg) => {
        handler1Called = true;
        throw new Error('Handler 1 error');
      });

      await redisSubscriber.subscribe(channel, async (ch, msg) => {
        handler2Called = true;
      });

      await redisClient.publish(channel, message);

      const result = await redisSubscriber.waitForMessage(channel, 2000);

      expect(result).not.toBeNull();
      expect(handler1Called).toBe(true);
      expect(handler2Called).toBe(true);
    });
  });

  describe('Message Timing', () => {
    it('should track message timestamps', async () => {
      const channel = 'test:timing';
      const message = 'test-message';

      await redisSubscriber.subscribe(channel);

      const beforePublish = Date.now();
      await redisClient.publish(channel, message);
      const afterPublish = Date.now();

      const result = await redisSubscriber.waitForMessage(channel, 2000);

      expect(result).not.toBeNull();
      expect(result!.timestamp).toBeGreaterThanOrEqual(beforePublish);
      expect(result!.timestamp).toBeLessThanOrEqual(afterPublish + 1000); // Allow some buffer
    });
  });

  describe('Database Isolation', () => {
    it('should use database 7 for isolation', () => {
      expect(redisSubscriber.getTestDatabaseNumber()).toBe(7);
    });

    it('should not interfere with other databases', async () => {
      const channel = 'test:isolation';
      const message = 'test-message';

      await redisSubscriber.subscribe(channel);

      // Publish to test database (should be received)
      await redisClient.publish(channel, message);

      const result = await redisSubscriber.waitForMessage(channel, 2000);
      expect(result).not.toBeNull();
      expect(result!.message).toBe(message);
    });
  });
});
