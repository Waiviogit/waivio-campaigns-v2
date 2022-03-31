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
        this.handleExpired,
      );
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async handleExpired(key: string): Promise<void> {}
}
