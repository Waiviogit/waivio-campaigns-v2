import { configService } from '../../../common/config';
import { Inject, Injectable } from '@nestjs/common';
import { SponsorsBotInterface } from '../../../domain/sponsors-bot/interface';
import {
  CAMPAIGN_PROVIDE,
  REWARDS_PROVIDE,
  SPONSORS_BOT_PROVIDE,
} from '../../../common/constants';
import {
  RedisExpireSubscriber,
  RedisPublishSubscriber,
} from './redis-subscriber';
import { CampaignExpiredListenerInterface } from '../../../domain/campaign/interface';
import { GiveawayObjectInterface } from '../../../domain/campaign/rewards/interface/giveaway-object.interface';
import { ContestInterface } from '../../../domain/campaign/rewards/interface/contest.interface';

@Injectable()
export class RedisCampaignSubscriber extends RedisExpireSubscriber {
  constructor(
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
    @Inject(CAMPAIGN_PROVIDE.EXPIRED_LISTENER)
    private readonly campaignExpiredListener: CampaignExpiredListenerInterface,
    @Inject(REWARDS_PROVIDE.GIVEAWAY_OBJECT)
    private readonly giveawayObject: GiveawayObjectInterface,
    @Inject(REWARDS_PROVIDE.CONTEST_OBJECT)
    private readonly contest: ContestInterface,
  ) {
    super(
      configService.getRedisCampaignsConfig(),
      configService.getRedisCampaignsDB(),
    );
  }

  async handleExpired(key: string, event: string): Promise<void> {
    await this.sponsorsBot.expireListener(key);
    await this.campaignExpiredListener.listener(key);
    await this.giveawayObject.listener(key);
    await this.contest.listener(key);
  }
}

const PUBLISH_CHANNEL = Object.freeze({
  FIELD_UPDATE_AUTHORITY: 'field_update:authority',
} as const);

type CampaignChannelType =
  (typeof PUBLISH_CHANNEL)[keyof typeof PUBLISH_CHANNEL];

@Injectable()
export class RedisCampaignPublishSubscriber extends RedisPublishSubscriber {
  constructor() {
    super(
      configService.getRedisCampaignsConfig(),
      Object.values(PUBLISH_CHANNEL),
    );
  }

  async handleMessage(
    channel: CampaignChannelType,
    message: string,
  ): Promise<void> {
    console.log();
  }
}
