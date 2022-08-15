import { Inject, Injectable } from '@nestjs/common';
import {
  GetReceivablesInterface,
  UserPaymentsQueryInterface,
} from './interface/user-payments.query.interface';
import { CAMPAIGN_PAYMENT_PROVIDE } from '../../common/constants';
import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';
import { getUserPayablesPipe } from './pipes/user-payments.query.pipes';

@Injectable()
export class UserPaymentsQuery implements UserPaymentsQueryInterface {
  constructor(
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPaymentRepository: CampaignPaymentRepositoryInterface,
  ) {}

  async getReceivables({
    userName,
    payoutToken,
    payable,
    days,
  }: GetReceivablesInterface) {
    const payables = await this.campaignPaymentRepository.aggregate({
      pipeline: getUserPayablesPipe({ userName, payoutToken, payable, days }),
    });

    return payables;
  }
}
