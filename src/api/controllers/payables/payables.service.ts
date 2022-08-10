import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_PAYMENT_PROVIDE } from '../../../common/constants';
import { GuidePaymentsQueryInterface } from '../../../domain/campaign-payment/interface';
import {
  GetPayablesOutType,
  GetPayablesType,
} from '../../../domain/campaign-payment/types';

@Injectable()
export class PayablesService {
  constructor(
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.GUIDE_PAYMENTS_Q)
    private readonly guidePaymentsQueryInterface: GuidePaymentsQueryInterface,
  ) {}

  async getGuidePayments({
    guideName,
    payoutToken,
  }: GetPayablesType): Promise<GetPayablesOutType> {
    return this.guidePaymentsQueryInterface.getPayables({
      guideName,
      payoutToken,
    });
  }
}
