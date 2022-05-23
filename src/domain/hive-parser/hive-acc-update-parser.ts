import { Inject, Injectable } from '@nestjs/common';

import { SPONSORS_BOT_PROVIDE } from '../../common/constants';
import { SponsorsBotInterface } from '../sponsors-bot/interface';
import { HiveAccountUpdateType } from '../../common/types';
import { HiveAccUpdateParserInterface } from './interface';

@Injectable()
export class HiveAccUpdateParser implements HiveAccUpdateParserInterface {
  constructor(
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
  ) {}

  async parse({ account, posting }: HiveAccountUpdateType): Promise<void> {
    if (!posting?.account_auths) return;
    await this.sponsorsBot.checkDisable({
      botName: account,
      accountAuths: posting.account_auths,
    });
  }
}
