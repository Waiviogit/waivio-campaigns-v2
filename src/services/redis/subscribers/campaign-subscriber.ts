import { configService } from '../../../common/config';
import { Inject, Injectable } from '@nestjs/common';
import { SponsorsBotInterface } from '../../../domain/sponsors-bot/interface';
import {
  CAMPAIGN_PROVIDE,
  SPONSORS_BOT_PROVIDE,
} from '../../../common/constants';
import { RedisExpireSubscriber } from './redis-subscriber';

import { CampaignExpiredListenerInterface } from '../../../domain/campaign/interface';

@Injectable()
export class RedisCampaignSubscriber extends RedisExpireSubscriber {
  constructor(
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
    @Inject(CAMPAIGN_PROVIDE.EXPIRED_LISTENER)
    private readonly campaignExpiredListener: CampaignExpiredListenerInterface,
  ) {
    super(
      configService.getRedisCampaignsConfig(),
      configService.getRedisCampaignsDB(),
    );
  }

  async handleExpired(key: string, event: string): Promise<void> {
    await this.sponsorsBot.expireListener(key);
    await this.campaignExpiredListener.listener(key);
  }
}
