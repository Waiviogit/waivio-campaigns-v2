import { createClient } from 'redis';
import { Logger, OnModuleInit } from '@nestjs/common';

export abstract class RedisExpireSubscriber implements OnModuleInit {
  private client;

  private readonly logger = new Logger(RedisExpireSubscriber.name);
  protected constructor(readonly url: string, readonly db: string) {
    this.client = createClient({
      url,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      this.client.configSet('notify-keyspace-events', 'Ex');
      this.client.subscribe(
        `__keyevent@${this.db}__:expired`,
        this.handleExpired.bind(this),
      );
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  abstract handleExpired(key: string, event: string): Promise<void>;
}

export abstract class RedisPublishSubscriber implements OnModuleInit {
  private client;

  protected readonly channels: string[];

  private readonly logger = new Logger(RedisPublishSubscriber.name);

  protected constructor(
    readonly url: string,
    channels: string[] | ReadonlyArray<string>,
  ) {
    this.channels = [...channels];
    this.client = createClient({
      url,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      for (const channel of this.channels) {
        await this.client.subscribe(channel, (message) =>
          this.handleMessage(channel, message),
        );
      }
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  abstract handleMessage(channel: string, message: string): Promise<void>;
}
