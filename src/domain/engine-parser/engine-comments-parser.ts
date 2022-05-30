import { Inject, Injectable } from '@nestjs/common';
import { EngineTransactionType } from '../../services/hive-engine-api/types';
import { EngineCommentsParserInterface } from './interface';
import {
  ENGINE_CONTRACT,
  POST_REWARD_EVENTS,
  SPONSORS_BOT_PROVIDE,
  SUPPORTED_ENGINE_TOKENS,
} from '../../common/constants';
import * as _ from 'lodash';
import { parseJSON } from '../../common/helpers';
import { EngineVoteType, FormatVotesAndRewardsType } from './types';

import { SponsorsBotInterface } from '../sponsors-bot/interface';

@Injectable()
export class EngineCommentsParser implements EngineCommentsParserInterface {
  constructor(
    @Inject(SPONSORS_BOT_PROVIDE.BOT)
    private readonly sponsorsBot: SponsorsBotInterface,
  ) {}
  async parse(comments: EngineTransactionType[]): Promise<void> {
    const { votes, rewards } = this.formatVotesAndRewards(comments);
    await this.parseVotes(votes);
  }

  async parseVotes(votes: EngineVoteType[]): Promise<void> {
    await this.sponsorsBot.parseVotes(votes);
  }

  formatVotesAndRewards(
    transactions: EngineTransactionType[],
  ): FormatVotesAndRewardsType {
    return _.reduce(
      transactions,
      (acc, transaction) => {
        const events = _.get(parseJSON(transaction.logs), 'events', []);
        if (
          _.isEmpty(events) ||
          !_.some(events, (e) =>
            _.includes(
              _.map(SUPPORTED_ENGINE_TOKENS, 'SYMBOL'),
              _.get(e, 'data.symbol'),
            ),
          )
        ) {
          return acc;
        }
        for (const event of events) {
          const eventType = _.get(event, 'event');
          const parseVoteCondition =
            _.includes(
              [
                ENGINE_CONTRACT.COMMENTS.EVENT.NEW_VOTE,
                ENGINE_CONTRACT.COMMENTS.EVENT.UPDATE_VOTE,
              ],
              eventType,
            ) &&
            _.includes(
              _.map(SUPPORTED_ENGINE_TOKENS, 'SYMBOL'),
              _.get(event, 'data.symbol'),
            ) &&
            (eventType === ENGINE_CONTRACT.COMMENTS.EVENT.NEW_VOTE ||
              eventType === ENGINE_CONTRACT.COMMENTS.EVENT.UPDATE_VOTE);
          const parseRewardsCondition =
            _.includes(POST_REWARD_EVENTS, _.get(event, 'event')) &&
            _.includes(
              _.map(SUPPORTED_ENGINE_TOKENS, 'SYMBOL'),
              _.get(event, 'data.symbol'),
            ) &&
            parseFloat(_.get(event, 'data.quantity')) !== 0;

          if (parseVoteCondition) {
            acc.votes.push({
              ...parseJSON(transaction.payload),
              rshares: parseFloat(_.get(event, 'data.rshares')),
              symbol: _.get(event, 'data.symbol'),
            });
          }
          if (parseRewardsCondition) {
            acc.rewards.push({
              operation: `${transaction.contract}_${event.event}`,
              ...event.data,
            });
          }
        }
        return acc;
      },
      { votes: [], rewards: [] },
    );
  }
}
