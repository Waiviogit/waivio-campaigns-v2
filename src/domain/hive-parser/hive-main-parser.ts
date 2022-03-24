import { Inject, Injectable } from '@nestjs/common';

import {
  HiveAccountUpdate,
  HiveBlock,
  HiveComment,
  HiveCommentOptions,
  HiveCustomJson,
  HiveTransfer,
  HiveVote,
} from '../../common/types';
import { HIVE_PARSER_PROVIDE } from '../../common/constants';
import { HiveCommentParser } from './interface/hive-comment-parser.interface';

@Injectable()
export class HiveMainParser {
  constructor(
    @Inject(HIVE_PARSER_PROVIDE.COMMENT)
    private readonly hiveCommentParser: HiveCommentParser,
  ) {}
  private votes = [];

  async parseHiveBlock(block: HiveBlock): Promise<void> {
    const { transactions } = block;
    for (const transaction of transactions) {
      if (!transaction?.operations && !transaction.operations[0]) continue;
      for (const operation of transaction.operations) {
        await (this[operation[0]] || this.default)(
          operation[1],
          transaction.operations[1],
        );
      }
      await this.processVotes();
    }
  }

  private vote(voteData: HiveVote): void {
    this.votes.push(voteData);
  }

  private async processVotes(): Promise<void> {
    // this._votes = [];
  }

  private async comment(
    commentData: HiveComment,
    commentOptions: HiveCommentOptions,
  ): Promise<void> {
    await this.hiveCommentParser.parse(commentData, commentOptions);
  }

  private async transfer(transferData: HiveTransfer): Promise<void> {}

  private async custom_json(customData: HiveCustomJson): Promise<void> {}

  private async account_update(
    accountUpdateData: HiveAccountUpdate,
  ): Promise<void> {}

  private async default(): Promise<void> {}
}
