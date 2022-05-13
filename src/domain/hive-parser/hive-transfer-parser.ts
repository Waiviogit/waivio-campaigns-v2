import { HiveTransferParseType } from './types';
import { HiveTransferParserInterface } from './interface';
import { parseJSON } from '../../common/helpers';
import { CAMPAIGN_PROVIDE, CAMPAIGN_TRANSFER_ID } from '../../common/constants';
import { configService } from '../../common/config';
import { Inject, Injectable } from '@nestjs/common';
import {
  CampaignSuspendInterface,
  DebtObligationsInterface,
} from '../campaign/interface';
import * as _ from 'lodash';

@Injectable()
export class HiveTransferParser implements HiveTransferParserInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.DEBT_OBLIGATIONS)
    private readonly debtObligations: DebtObligationsInterface,
    @Inject(CAMPAIGN_PROVIDE.SUSPEND)
    private readonly campaignSuspend: CampaignSuspendInterface,
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
          guideName: from,
          userName: to,
          transactionId,
        });
        await this.campaignSuspend.checkGuideForUnblock(from);
        break;
      case CAMPAIGN_TRANSFER_ID.GUEST_CAMPAIGN_REWARD:
        await this.debtObligations.processGuestPayment({
          amount: amount.split(' ')[0],
          payoutToken: amount.split(' ')[1],
          guideName: from,
          transactionId,
          memoJson,
          destination: to,
        });
        await this.campaignSuspend.checkGuideForUnblock(from);
        break;
    }
  }
}
