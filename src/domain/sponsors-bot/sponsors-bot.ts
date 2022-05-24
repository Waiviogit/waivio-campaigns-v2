import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as _ from 'lodash';

import {
  CheckDisableType,
  CreateUpvoteRecordsType,
  ParseHiveCustomJsonType,
} from './type';
import { SponsorsBotInterface } from './interface';
import { SPONSORS_BOT_COMMAND } from './constants';
import {
  PAYOUT_TOKEN_PRECISION,
  SPONSORS_BOT_PROVIDE,
  SPONSORS_BOT_UPVOTE_PROVIDE,
} from '../../common/constants';
import { SponsorsBotRepositoryInterface } from '../../persistance/sponsors-bot/interface';
import { SponsorsBotUpvoteRepositoryInterface } from '../../persistance/sponsors-bot-upvote/interface';
import BigNumber from 'bignumber.js';

@Injectable()
export class SponsorsBot implements SponsorsBotInterface {
  constructor(
    @Inject(SPONSORS_BOT_PROVIDE.REPOSITORY)
    private readonly sponsorsBotRepository: SponsorsBotRepositoryInterface,
    @Inject(SPONSORS_BOT_UPVOTE_PROVIDE.REPOSITORY)
    private readonly sponsorsBotUpvoteRepository: SponsorsBotUpvoteRepositoryInterface,
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

  async createUpvoteRecords({
    campaign,
    botName,
    permlink,
  }: CreateUpvoteRecordsType): Promise<void> {
    const tokenPrecision = PAYOUT_TOKEN_PRECISION[campaign.payoutToken];

    const rewardInToken = new BigNumber(campaign.rewardInUSD)
      .dividedBy(campaign.payoutTokenRateUSD)
      .decimalPlaces(tokenPrecision);

    for (const matchBot of campaign.matchBots) {
      const bot = await this.sponsorsBotRepository.findOne({
        filter: {
          'sponsors.sponsor': campaign.guideName,
          botName: matchBot,
          'sponsors.enabled': true,
        },
      });
      if (!bot) continue;
      const sponsorsPermissions = _.find(
        bot.sponsors,
        (record) => record.sponsor === campaign.guideName,
      );

      const reward = rewardInToken.times(2).decimalPlaces(tokenPrecision);

      const amountToVote = reward
        .times(sponsorsPermissions.votingPercent)
        .decimalPlaces(tokenPrecision);

      await this.sponsorsBotUpvoteRepository.create({
        requiredObject: campaign.requiredObject,
        symbol: campaign.payoutToken,
        reservationPermlink: campaign.userReservationPermlink,
        botName: bot.botName,
        author: botName || campaign.userName,
        sponsor: campaign.guideName,
        permlink,
        amountToVote: amountToVote.toNumber(),
        reward: reward.toNumber(),
      });
    }
  }
}
