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
