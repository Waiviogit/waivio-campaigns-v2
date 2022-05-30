import { configService } from '../../../common/config';
import { RedisExpireSubscriber } from './redis-subscriber';
import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { createClient } from 'redis';
import { SponsorsBotInterface } from '../../../domain/sponsors-bot/interface';
import { SPONSORS_BOT_PROVIDE } from '../../../common/constants';

@Injectable()
export class RedisCampaignSubscriber {
  constructor(
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
  ) {}

  private readonly client = createClient({
    url: configService.getRedisCampaignsConfig(),
  });
  private readonly logger = new Logger(RedisExpireSubscriber.name);

  async start(): Promise<void> {
    try {
      await this.client.connect();
      await this.client.configSet('notify-keyspace-events', 'Ex');
      await this.client.subscribe(
        `__keyevent@${configService.getRedisCampaignsDB()}__:expired`,
        this.handleExpired,
      );
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async handleExpired(key: string, event: string, ): Promise<void> {
    console.log();
    await this.sponsorsBot.expireListener(key);
  }
}
