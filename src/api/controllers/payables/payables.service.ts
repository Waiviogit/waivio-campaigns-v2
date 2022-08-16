import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_PAYMENT_PROVIDE } from '../../../common/constants';
import { GuidePaymentsQueryInterface } from '../../../domain/campaign-payment/interface';
import {
  GetPayableOutType,
  GetPayablesOutType,
  GetPayablesType,
  GetPayableType,
} from '../../../domain/campaign-payment/types';
import {
  GetReceivablesInterface,
  UserPaymentsQueryInterface,
} from '../../../domain/campaign-payment/interface/user-payments.query.interface';
import { ReceivablesOutType } from '../../../domain/campaign-payment/types/user-payments.query.types';

@Injectable()
export class PayablesService {
  constructor(
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.GUIDE_PAYMENTS_Q)
    private readonly guidePaymentsQueryInterface: GuidePaymentsQueryInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.USER_PAYMENTS_Q)
    private readonly userPaymentsQuery: UserPaymentsQueryInterface,
  ) {}

  async getGuidePayments(params: GetPayablesType): Promise<GetPayablesOutType> {
    return this.guidePaymentsQueryInterface.getPayables(params);
  }

  async getGuidePaymentsByUser(
    params: GetPayableType,
  ): Promise<GetPayableOutType> {
    return this.guidePaymentsQueryInterface.getPayable(params);
  }

  async getUserReceivables(
    params: GetReceivablesInterface,
  ): Promise<ReceivablesOutType> {
    return this.userPaymentsQuery.getReceivables(params);
  }
}
