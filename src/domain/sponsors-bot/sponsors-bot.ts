import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as _ from 'lodash';

import { CheckDisableType, ParseHiveCustomJsonType } from './type';
import { SponsorsBotInterface } from './interface';
import { SPONSORS_BOT_COMMAND } from './constants';
import { SPONSORS_BOT_PROVIDE } from '../../common/constants';
import { SponsorsBotRepositoryInterface } from '../../persistance/sponsors-bot/interface';

@Injectable()
export class SponsorsBot implements SponsorsBotInterface {
  constructor(
    @Inject(SPONSORS_BOT_PROVIDE.REPOSITORY)
    private readonly sponsorsBotRepository: SponsorsBotRepositoryInterface,
  ) {}

  async parseHiveCustomJson({
    id,
    authorizedUser,
    json,
  }: ParseHiveCustomJsonType): Promise<void> {
    switch (id) {
      case SPONSORS_BOT_COMMAND.SET_RULE:
        const expired = moment(json.expiredAt).utc().toDate();
        const tomorrow = moment().utc().add(1, 'days').startOf('day').toDate();
        if (json.sponsor && (!json.expiredAt || expired >= tomorrow)) {
          await this.sponsorsBotRepository.setSponsorsBot({
            botName: authorizedUser,
            sponsor: json.sponsor,
            votingPercent: json.votingPercent,
            enabled: json.enabled,
            note: json.note,
            expiredAt: json.expiredAt
              ? moment(json.expiredAt).utc().startOf('day').toDate()
              : null,
          });
        }
        break;
      case SPONSORS_BOT_COMMAND.REMOVE_RULE:
        if (json.sponsor) {
          await this.sponsorsBotRepository.removeRule({
            botName: authorizedUser,
            sponsor: json.sponsor,
          });
        }
        break;
      case SPONSORS_BOT_COMMAND.CHANGE_POWER:
        if (json.votingPower) {
          await this.sponsorsBotRepository.setVotingPower({
            botName: authorizedUser,
            minVotingPower: json.votingPower,
          });
        }
        break;
    }
  }

  async checkDisable({
    botName,
    accountAuths,
  }: CheckDisableType): Promise<void> {
    if (
      this.isAccountsIncludeBot(process.env.SPONSORS_BOT_NAME, accountAuths)
    ) {
      return;
    }
    const bots = await this.sponsorsBotRepository.getSponsorsBot({
      botName,
      limit: 1,
    });

    if (!_.isEmpty(bots.results)) {
      await this.sponsorsBotRepository.updateStatus({
        botName: botName,
        enabled: false,
      });
    }
  }

  isAccountsIncludeBot(
    botName: string,
    accountAuths: [string, number][],
  ): boolean {
    return _.flattenDepth(accountAuths).includes(botName);
  }
}
