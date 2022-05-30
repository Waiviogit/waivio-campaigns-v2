import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { EngineBlockType } from '../../services/hive-engine-api/types';
import {
  EngineCommentsParserInterface,
  EngineMainParserInterface,
  EngineTransferParserInterface,
} from './interface';
import { parseJSON } from '../../common/helpers';
import { TransferPayloadType } from './types';
import { ENGINE_CONTRACT, ENGINE_PARSER_PROVIDE } from '../../common/constants';

@Injectable()
export class EngineMainParser implements EngineMainParserInterface {
  constructor(
    @Inject(ENGINE_PARSER_PROVIDE.TRANSFER)
    private readonly engineTransferParser: EngineTransferParserInterface,
    @Inject(ENGINE_PARSER_PROVIDE.COMMENTS)
    private readonly engineCommentsParser: EngineCommentsParserInterface,
  ) {}

  async parseBlock(block: EngineBlockType): Promise<void> {
    await this.engineCommentsParser.parse(
      block.transactions.filter(
        (transaction) => transaction.contract === ENGINE_CONTRACT.COMMENTS.NAME,
      ),
    );

    for (const transaction of block.transactions) {
      if (
        transaction.contract === ENGINE_CONTRACT.TOKENS.NAME &&
        transaction.action === ENGINE_CONTRACT.TOKENS.ACTION.TRANSFER
      ) {
        if (this.hasLogsErrors(transaction.logs)) continue;
        const payload: TransferPayloadType = parseJSON(
          transaction.payload,
          null,
        );
        if (!payload) continue;
        await this.engineTransferParser.parse({
          transfer: { ...payload, sender: transaction.sender },
          transactionId: transaction.transactionId,
        });
        continue;
      }
    }
  }

  hasLogsErrors(logs: string): boolean {
    const result = parseJSON(logs, null);
    return _.has(result, 'errors');
  }
}
