import { Inject, Injectable } from '@nestjs/common';

import { HiveBlockType } from '../../common/types';
import { HIVE_PARSER_PROVIDE } from '../../common/constants';
import {
  HiveCommentParserInterface,
  HiveMainParserInterface,
} from './interface';

@Injectable()
export class HiveMainParser implements HiveMainParserInterface {
  constructor(
    @Inject(HIVE_PARSER_PROVIDE.COMMENT)
    private readonly comment: HiveCommentParserInterface,
  ) {}

  async parseHiveBlock(block: HiveBlockType): Promise<void> {
    const { transactions } = block;
    for (const transaction of transactions) {
      if (!transaction?.operations && !transaction.operations[0]) continue;
      for (const operation of transaction.operations) {
        const [parserType] = operation;
        //check custom json

        if (this.hasOwnProperty(parserType)) {
          await this[parserType].parse(operation[1], transaction.operations[1]);
        }
      }
      //await this.processVotes();
    }
  }

  // private vote(voteData: HiveVoteType): void {
  //   this.votes.push(voteData);
  // }
  // private async processVotes(): Promise<void> {
  //   // this._votes = [];
  // }
  // private async transfer(transferData: HiveTransferType): Promise<void> {}
  // private async custom_json(customData: HiveCustomJsonType): Promise<void> {}
  // private async account_update(
  //   accountUpdateData: HiveAccountUpdateType,
  // ): Promise<void> {}
}
