import { HiveTransferParseType } from './types';
import { HiveTransferParserInterface } from './interface';
import { parseJSON } from '../../common/helpers';
import { CAMPAIGN_PROVIDE, CAMPAIGN_TRANSFER_ID } from '../../common/constants';
import { configService } from '../../common/config';
import { Inject, Injectable } from '@nestjs/common';
import { DebtObligationsInterface } from '../campaign/interface';
import * as _ from 'lodash'

@Injectable()
export class HiveTransferParser implements HiveTransferParserInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.DEBT_OBLIGATIONS)
    private readonly debtObligations: DebtObligationsInterface,
  ) {}

  async parse({
    transfer,
    transactionId,
  }: HiveTransferParseType): Promise<void> {
    const { amount, from, to, memo } = transfer;
    if (typeof amount !== 'string' || !amount.includes('HIVE')) return;
    const memoJson = parseJSON(memo, null);
    if (!_.has(memoJson, 'id')) return;
    switch (memoJson.id) {
      case CAMPAIGN_TRANSFER_ID.CAMPAIGN_REWARD:
        if (memoJson.app === configService.getAntiApp()) return;
        await this.debtObligations.processPayment({
          amount: amount.split(' ')[0],
          payoutToken: amount.split(' ')[1],
          sponsor: from,
          userName: to,
          transactionId,
          isDemoAccount: false,
        });
    }
  }
}
