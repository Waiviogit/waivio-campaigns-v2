import { Inject, Injectable } from '@nestjs/common';

import {
  HiveAccountUpdateType,
  HiveBlockType,
  HiveCommentOptionsType,
  HiveCommentType,
  HiveCustomJsonType,
} from '../../common/types';
import { HIVE_PARSER_PROVIDE } from '../../common/constants';
import {
  HiveAccUpdateParserInterface,
  HiveCommentParserInterface,
  HiveJsonParserInterface,
  HiveMainParserInterface,
  HiveTransferParserInterface,
} from './interface';
import { HiveTransferType } from './types';
import { HIVE_OPERATION } from './constants';

@Injectable()
export class HiveMainParser implements HiveMainParserInterface {
  constructor(
    @Inject(HIVE_PARSER_PROVIDE.COMMENT)
    private readonly comment: HiveCommentParserInterface,
    @Inject(HIVE_PARSER_PROVIDE.TRANSFER)
    private readonly transfer: HiveTransferParserInterface,
    @Inject(HIVE_PARSER_PROVIDE.JSON)
    private readonly json: HiveJsonParserInterface,
    @Inject(HIVE_PARSER_PROVIDE.ACCOUNT_UPDATE)
    private readonly accountUpdate: HiveAccUpdateParserInterface,
  ) {}

  async parseBlock(block: HiveBlockType): Promise<void> {
    const { transactions, timestamp } = block;
    process.env.BLOCK_MAIN_NUMBER = String(transactions[0].block_num);
    process.env.BLOCK_MAIN_TIMESTAMP = timestamp;

    for (const transaction of transactions) {
      if (!transaction?.operations && !transaction.operations[0]) continue;
      for (const operation of transaction.operations) {
        const [parserType] = operation;

        switch (parserType) {
          case HIVE_OPERATION.TRANSFER:
            await this.transfer.parse({
              transfer: operation[1] as HiveTransferType,
              transactionId: transaction.transaction_id,
            });
            break;

          case HIVE_OPERATION.COMMENT:
            await this.comment.parse({
              comment: operation[1] as HiveCommentType,
              options: transaction
                .operations[1] as unknown as HiveCommentOptionsType,
            });
            break;
          case HIVE_OPERATION.CUSTOM_JSON:
            await this.json.parse(operation[1] as HiveCustomJsonType);
            break;
          case HIVE_OPERATION.ACCOUNT_UPDATE:
            await this.accountUpdate.parse(
              operation[1] as HiveAccountUpdateType,
            );
            break;
        }
      }
    }
  }
}
