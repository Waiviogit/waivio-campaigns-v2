import { Inject, Injectable } from '@nestjs/common';
import { HiveCustomJsonType } from '../../common/types';
import { HiveJsonParserInterface } from './interface';
import { parseJSON } from '../../common/helpers';
import * as _ from 'lodash';
import {
  BLACKLIST_PROVIDE,
  REDIS_KEY,
  REDIS_PROVIDE,
  SPONSORS_BOT_PROVIDE,
} from '../../common/constants';
import { SponsorsBotInterface } from '../sponsors-bot/interface';
import { BlacklistParserInterface } from '../blacklist/interface';
import { RedisClientInterface } from '../../services/redis/clients/interface';

@Injectable()
export class HiveJsonParser implements HiveJsonParserInterface {
  constructor(
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
    @Inject(BLACKLIST_PROVIDE.PARSER)
    private readonly blacklistParser: BlacklistParserInterface,
    @Inject(REDIS_PROVIDE.CAMPAIGN_CLIENT)
    private readonly campaignRedisClient: RedisClientInterface,
  ) {}
  async parse({
    id,
    json,
    required_auths,
    required_posting_auths,
    transaction_id,
  }: HiveCustomJsonType): Promise<void> {
    const parsedJson = parseJSON(json);
    if (!parsedJson) return;
    const authorizedUser = _.isEmpty(required_auths)
      ? required_posting_auths[0]
      : required_auths[0];
    await this.blacklistParser.parseHiveCustomJson({
      user: authorizedUser,
      names: parsedJson.names,
      type: id,
    });

    await this.sponsorsBot.parseHiveCustomJson({
      id,
      authorizedUser,
      json: parsedJson,
      transaction_id,
    });

    await this.publishToChannel(transaction_id, id);
  }

  async publishToChannel(transaction_id: string, id: string): Promise<void> {
    const operationsToPublish = ['confirm_referral_license'];

    if (!operationsToPublish.includes(id)) return;

    await this.campaignRedisClient.publish(
      REDIS_KEY.PUBLISH_EXPIRE_TRX_ID,
      transaction_id,
    );
  }
}
