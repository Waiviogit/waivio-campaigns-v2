import { createClient } from 'redis';
import { Logger, OnModuleInit } from '@nestjs/common';

export interface TestMessageHandler {
  (channel: string, message: string): Promise<void>;
}

export class RedisTestSubscriber implements OnModuleInit {
  private client;
  private readonly logger = new Logger(RedisTestSubscriber.name);
  private readonly TEST_DB = 7;
  private messageHandlers: Map<string, TestMessageHandler[]> = new Map();
  private receivedMessages: Array<{
    channel: string;
    message: string;
    timestamp: number;
  }> = [];

  constructor(readonly url: string) {
    this.client = createClient({
      url,
      database: this.TEST_DB,
    });
    this.client.on('error', (err) =>
      this.logger.error('Redis Test Subscriber Error', err),
    );
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      // Configure keyspace events for expired notifications
      await this.client.configSet('notify-keyspace-events', 'Ex');
      this.logger.log(
        `Connected to Redis test subscriber database ${this.TEST_DB}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to connect to Redis test subscriber: ${error.message}`,
      );
      throw error;
    }
  }

  async subscribe(
    channel: string,
    handler?: TestMessageHandler,
  ): Promise<void> {
    try {
      if (handler) {
        if (!this.messageHandlers.has(channel)) {
          this.messageHandlers.set(channel, []);
        }
        this.messageHandlers.get(channel)!.push(handler);
      }

      await this.client.subscribe(channel, (message) => {
        this.handleMessage(channel, message);
      });

      this.logger.log(`Subscribed to channel: ${channel}`);
    } catch (error) {
      this.logger.error(
        `Error subscribing to channel ${channel}: ${error.message}`,
      );
      throw error;
    }
  }

  async subscribeToExpiredEvents(handler?: TestMessageHandler): Promise<void> {
    try {
      const expiredChannel = `__keyevent@${this.TEST_DB}__:expired`;

      if (handler) {
        if (!this.messageHandlers.has(expiredChannel)) {
          this.messageHandlers.set(expiredChannel, []);
        }
        this.messageHandlers.get(expiredChannel)!.push(handler);
      }

      await this.client.subscribe(expiredChannel, (message) => {
        this.handleMessage(expiredChannel, message);
      });

      this.logger.log(
        `Subscribed to expired events on database ${this.TEST_DB}`,
      );
    } catch (error) {
      this.logger.error(
        `Error subscribing to expired events: ${error.message}`,
      );
      throw error;
    }
  }

  private async handleMessage(channel: string, message: string): Promise<void> {
    const timestamp = Date.now();
    this.receivedMessages.push({ channel, message, timestamp });

    this.logger.log(`Received message on ${channel}: ${message}`);

    const handlers = this.messageHandlers.get(channel);
    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler(channel, message);
        } catch (error) {
          this.logger.error(
            `Error in message handler for ${channel}: ${error.message}`,
          );
        }
      }
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.client.unsubscribe(channel);
      this.messageHandlers.delete(channel);
      this.logger.log(`Unsubscribed from channel: ${channel}`);
    } catch (error) {
      this.logger.error(
        `Error unsubscribing from channel ${channel}: ${error.message}`,
      );
      throw error;
    }
  }

  getReceivedMessages(): Array<{
    channel: string;
    message: string;
    timestamp: number;
  }> {
    return [...this.receivedMessages];
  }

  getMessagesForChannel(
    channel: string,
  ): Array<{ channel: string; message: string; timestamp: number }> {
    return this.receivedMessages.filter((msg) => msg.channel === channel);
  }

  clearReceivedMessages(): void {
    this.receivedMessages = [];
  }

  clearHandlers(): void {
    this.messageHandlers.clear();
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      this.logger.log('Redis test subscriber disconnected');
    } catch (error) {
      this.logger.error(`Error disconnecting: ${error.message}`);
      throw error;
    }
  }

  getTestDatabaseNumber(): number {
    return this.TEST_DB;
  }

  // Test-specific methods
  async waitForMessage(
    channel: string,
    timeout = 5000,
  ): Promise<{ channel: string; message: string; timestamp: number } | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const messages = this.getMessagesForChannel(channel);
      if (messages.length > 0) {
        return messages[messages.length - 1];
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return null;
  }

  async waitForMessageCount(
    channel: string,
    count: number,
    timeout = 5000,
  ): Promise<Array<{ channel: string; message: string; timestamp: number }>> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const messages = this.getMessagesForChannel(channel);
      if (messages.length >= count) {
        return messages.slice(-count);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return this.getMessagesForChannel(channel);
  }
}
