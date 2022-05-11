import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { EngineTransferParserType } from './types/engine-transfer-parser.types';
import { parseJSON } from '../../common/helpers';
import { CAMPAIGN_PROVIDE, CAMPAIGN_TRANSFER_ID } from '../../common/constants';
import { configService } from '../../common/config';
import {
  CampaignSuspendInterface,
  DebtObligationsInterface,
} from '../campaign/interface';
import { EngineTransferParserInterface } from './interface';

@Injectable()
export class EngineTransferParser implements EngineTransferParserInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.DEBT_OBLIGATIONS)
    private readonly debtObligations: DebtObligationsInterface,
    @Inject(CAMPAIGN_PROVIDE.SUSPEND)
    private readonly campaignSuspend: CampaignSuspendInterface,
  ) {}

  async parse({
    transfer,
    transactionId,
  }: EngineTransferParserType): Promise<void> {
    const memoJson = parseJSON(transfer.memo, null);
    if (!_.has(memoJson, 'id')) return;

    switch (memoJson.id) {
      case CAMPAIGN_TRANSFER_ID.CAMPAIGN_REWARD:
        if (memoJson.app === configService.getAntiApp()) return;
        await this.debtObligations.processPayment({
          amount: transfer.quantity,
          payoutToken: transfer.symbol,
          guideName: transfer.sender,
          userName: transfer.to,
          transactionId,
          isDemoAccount: false,
        });
        await this.campaignSuspend.checkGuideForUnblock(transfer.sender);
    }
  }
}
