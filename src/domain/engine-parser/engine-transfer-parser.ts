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
        });
        //only Waiv for now
        await this.campaignSuspend.getGuideDebt({
          guideName: transfer.sender,
          tokens: [transfer.symbol],
        });
        await this.campaignSuspend.checkGuideForUnblock(transfer.sender);
        break;
      case CAMPAIGN_TRANSFER_ID.GUEST_CAMPAIGN_REWARD:
        await this.debtObligations.processGuestPayment({
          amount: transfer.quantity,
          payoutToken: transfer.symbol,
          guideName: transfer.sender,
          transactionId,
          memoJson,
          destination: transfer.to,
        });
        //only Waiv for now
        await this.campaignSuspend.getGuideDebt({
          guideName: transfer.sender,
          tokens: [transfer.symbol],
        });
        await this.campaignSuspend.checkGuideForUnblock(transfer.sender);
        break;
    }
  }
}
