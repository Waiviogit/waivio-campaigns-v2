import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import {
  GetReceivablesInterface,
  UserPaymentsQueryInterface,
} from './interface/user-payments.query.interface';
import { CAMPAIGN_PAYMENT_PROVIDE } from '../../common/constants';
import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';
import { getUserPayablesPipe, getUserTotalPayablePipe } from './pipes';
import {
  ReceivablesOutType,
  UserReceivablesType,
} from './types/user-payments.query.types';

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
  }: GetReceivablesInterface): Promise<ReceivablesOutType> {
    const histories: UserReceivablesType[] =
      await this.campaignPaymentRepository.aggregate({
        pipeline: getUserPayablesPipe({ userName, payoutToken, payable, days }),
      });

    const totalPayable = await this.campaignPaymentRepository.aggregate({
      pipeline: getUserTotalPayablePipe({ userName, payoutToken }),
    });

    return { histories, totalPayable: _.get(totalPayable, '[0].total', 0) };
  }
}
