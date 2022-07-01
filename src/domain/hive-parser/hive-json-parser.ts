import { Inject, Injectable } from '@nestjs/common';
import { HiveCustomJsonType } from '../../common/types';
import { HiveJsonParserInterface } from './interface';
import { parseJSON } from '../../common/helpers';
import * as _ from 'lodash';
import {
  BLACKLIST_PROVIDE,
  SPONSORS_BOT_PROVIDE,
} from '../../common/constants';
import { SponsorsBotInterface } from '../sponsors-bot/interface';
import { BlacklistParserInterface } from '../blacklist/interface';

@Injectable()
export class HiveJsonParser implements HiveJsonParserInterface {
  constructor(
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
    @Inject(BLACKLIST_PROVIDE.PARSER)
    private readonly blacklistParser: BlacklistParserInterface,
  ) {}
  async parse({
    id,
    json,
    required_auths,
    required_posting_auths,
  }: HiveCustomJsonType): Promise<void> {
    const parsedJson = parseJSON(json);
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
    });
  }
}
