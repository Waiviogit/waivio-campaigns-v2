import { Inject, Injectable } from '@nestjs/common';
import {
  RECURRENT_TYPE,
  REDIS_KEY,
  REDIS_PROVIDE,
} from '../../../common/constants';
import { RedisClientInterface } from '../../../services/redis/clients/interface';
import { rrulestr } from 'rrule';
import { GiveawayObjectInterface } from './interface/giveaway-object.interface';

@Injectable()
export class GiveawayObject implements GiveawayObjectInterface {
  constructor(
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
  ) {}
  async setNextRecurrentEvent(rruleString: string, _id: string): Promise<void> {
    const rruleObject = rrulestr(rruleString);
    const now = new Date();
    const next = rruleObject.after(now, true);
    if (!next) {
      //todo setex expire
      return;
    }
    const expire = Math.max(
      0,
      Math.floor((next.getTime() - now.getTime()) / 1000),
    );
    await this.campaignRedisClient.setex(
      `${REDIS_KEY.GIVEAWAY_OBJECT_RECURRENT}${_id}`,
      expire,
      '',
    );
  }
  async startGiveaway(_id: string): Promise<void> {}

  async listener(key: string): Promise<void> {
    const [, type, id] = key.split(':');
    switch (type) {
      case RECURRENT_TYPE.GIVEAWAY_OBJECT:
        return this.startGiveaway(id);
      default:
        return;
    }
  }
}
