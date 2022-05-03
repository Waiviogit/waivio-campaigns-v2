import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import {
  CAMPAIGN_PAYMENT,
  CAMPAIGN_PAYMENT_PROVIDE,
  PAYOUT_TOKEN,
} from '../../common/constants';
import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';
import { ProcessPaymentType } from './types/debt-obligations.types';
import { DebtObligationsInterface } from './interface';

@Injectable()
export class DebtObligations implements DebtObligationsInterface {
  constructor(
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPaymentRepository: CampaignPaymentRepositoryInterface,
  ) {}

  async processPayment({
    amount,
    payoutToken,
    sponsor,
    userName,
    transactionId,
    isDemoAccount,
  }: ProcessPaymentType): Promise<void> {
    if (!_.includes(Object.values(PAYOUT_TOKEN), payoutToken)) return;

    await this.campaignPaymentRepository.create({
      amount: new BigNumber(amount),
      type: CAMPAIGN_PAYMENT.TRANSFER,
      payoutToken,
      sponsor,
      userName,
      transactionId,
      isDemoAccount,
    });
  }
}
