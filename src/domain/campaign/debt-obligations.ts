import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import {
  CAMPAIGN_PAYMENT,
  CAMPAIGN_PAYMENT_PROVIDE,
  PAYOUT_TOKEN,
  USER_PROVIDE,
} from '../../common/constants';
import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';
import {
  ProcessGuestPaymentType,
  ProcessPaymentType,
} from './types/debt-obligations.types';
import { DebtObligationsInterface } from './interface';

import { UserRepositoryInterface } from '../../persistance/user/interface';

@Injectable()
export class DebtObligations implements DebtObligationsInterface {
  constructor(
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPaymentRepository: CampaignPaymentRepositoryInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async processPayment({
    amount,
    payoutToken,
    guideName,
    userName,
    transactionId,
  }: ProcessPaymentType): Promise<void> {
    if (!_.includes(Object.values(PAYOUT_TOKEN), payoutToken)) return;

    await this.campaignPaymentRepository.create({
      amount: new BigNumber(amount),
      type: CAMPAIGN_PAYMENT.TRANSFER,
      payoutToken,
      guideName,
      userName,
      transactionId,
      isDemoAccount: false,
    });
  }

  async processGuestPayment({
    amount,
    payoutToken,
    guideName,
    memoJson,
    transactionId,
    destination,
  }: ProcessGuestPaymentType): Promise<void> {
    if (!_.includes(Object.values(PAYOUT_TOKEN), payoutToken)) return;
    const guestUser = await this.userRepository.findOne({
      filter: { name: memoJson.to },
    });
    if (process.env.HOT_WALLET !== destination || !guestUser) {
      return;
    }

    await this.campaignPaymentRepository.create({
      amount: new BigNumber(amount),
      type: CAMPAIGN_PAYMENT.TRANSFER_TO_GUEST,
      payoutToken,
      guideName,
      userName: memoJson.to,
      transactionId,
      isDemoAccount: true,
    });
  }
}
