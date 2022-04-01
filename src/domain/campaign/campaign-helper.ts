import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { ObjectId } from 'mongoose';

import { REDIS_KEY, REDIS_PROVIDE } from '../../common/constants';
import { RedisClientInterface } from '../../services/redis/clients/interface';
import { CampaignHelperInterface } from './interface/campaign-helper.interface';

@Injectable()
export class CampaignHelper implements CampaignHelperInterface {
  constructor(
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
  ) {}

  async setExpireTTLCampaign(expiredAt: Date, _id: ObjectId): Promise<void> {
    const expire = moment.utc(expiredAt).unix() - moment.utc().unix();

    await this.campaignRedisClient.setex(
      `${REDIS_KEY.CAMPAIGN_EXPIRE}${_id.toString()}`,
      expire,
      '',
    );
  }

  async deleteCampaignKey(key: string): Promise<void> {
    await this.campaignRedisClient.deleteKey(key);
  }
}
