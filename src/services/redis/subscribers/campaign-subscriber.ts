import { configService } from '../../../common/config';
import { RedisExpireSubscriber } from './redis-subscriber';

export class RedisCampaignSubscriber extends RedisExpireSubscriber {
  constructor() {
    super(
      configService.getRedisCampaignsConfig(),
      configService.getRedisCampaignsDB(),
    );
  }
  async handleExpired(key: string): Promise<void> {
    //TODO
    console.log();
  }
}
