import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';

import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';
import {
  CAMPAIGN_PAYMENT,
  CAMPAIGN_PAYMENT_PROVIDE,
} from '../../common/constants';
import {
  CampaignPaymentUserType,
  GetPayableAggregateType,
  GetPayablesOutType,
  GetPayableType,
  PayablesAllType,
  GetPayablesType,
  getNotPayedDaysType,
  GetPayableOutType,
  GetGuidesTotalPayedType,
  GuidesTotalPayedType,
} from './types';
import { GuidePaymentsQueryInterface } from './interface';
import {
  getGuidesTotalPayedPipe,
  getHistoriesByUserPipe,
  getPayableByUserPipe,
  getPayablesPipe,
  getTotalGuideTotalPayablePipe,
} from './pipes';

@Injectable()
export class GuidePaymentsQuery implements GuidePaymentsQueryInterface {
  constructor(
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPaymentRepository: CampaignPaymentRepositoryInterface,
  ) {}

  async getGuidesTotalPayed({
    guideNames,
    payoutToken,
  }: GetGuidesTotalPayedType): Promise<GuidesTotalPayedType[]> {
    const payed: GuidesTotalPayedType[] =
      await this.campaignPaymentRepository.aggregate({
        pipeline: getGuidesTotalPayedPipe({ guideNames, payoutToken }),
      });

    return payed;
  }

  //use in suspend task
  async getPayables({
    guideName,
    payoutToken,
    payable,
    days,
  }: GetPayablesType): Promise<GetPayablesOutType> {
    const histories: PayablesAllType[] =
      await this.campaignPaymentRepository.aggregate({
        pipeline: getPayablesPipe({ guideName, payoutToken, payable, days }),
      });

    const totalPayable = await this.campaignPaymentRepository.aggregate({
      pipeline: getTotalGuideTotalPayablePipe({ guideName, payoutToken }),
    });

    return { histories, totalPayable: _.get(totalPayable, '[0].total', 0) };
  }

  async getPayable({
    guideName,
    payoutToken,
    userName,
  }: GetPayableType): Promise<GetPayableOutType> {
    const histories = await this.getHistoriesByUser({
      guideName,
      payoutToken,
      userName,
    });
    const totalPayable = await this.getPayableByUser({
      guideName,
      payoutToken,
      userName,
    });

    const notPayedPeriod = this.getNotPayedDays({ totalPayable, histories });

    return { histories, totalPayable, notPayedPeriod };
  }

  getNotPayedDays({ histories, totalPayable }: getNotPayedDaysType): number {
    if (totalPayable <= 0) return 0;
    let count = new BigNumber(totalPayable);
    let lastDate = new Date();
    for (const history of histories) {
      if (count.lte(0)) break;
      count = count.minus(history.amount);
      lastDate = history.createdAt;
    }
    return moment.utc().diff(moment.utc(lastDate), 'days');
  }

  async getPayableByUser({
    guideName,
    payoutToken,
    userName,
  }: GetPayableType): Promise<number> {
    const payables: GetPayableAggregateType[] =
      await this.campaignPaymentRepository.aggregate({
        pipeline: getPayableByUserPipe({ guideName, userName, payoutToken }),
      });

    return payables[0]?.payable;
  }

  async getHistoriesByUser({
    guideName,
    payoutToken,
    userName,
  }: GetPayableType): Promise<CampaignPaymentUserType[]> {
    let balance = 0;

    const histories: CampaignPaymentUserType[] =
      await this.campaignPaymentRepository.aggregate({
        pipeline: getHistoriesByUserPipe({ guideName, userName, payoutToken }),
      });

    for (const history of histories) {
      switch (history.type) {
        case CAMPAIGN_PAYMENT.COMPENSATION_FEE:
        case CAMPAIGN_PAYMENT.INDEX_FEE:
        case CAMPAIGN_PAYMENT.BENEFICIARY_FEE:
        case CAMPAIGN_PAYMENT.CAMPAIGNS_SERVER_FEE:
        case CAMPAIGN_PAYMENT.REFERRAL_SERVER_FEE:
        //not sure
        case CAMPAIGN_PAYMENT.OVERPAYMENT_REFUND:
        case CAMPAIGN_PAYMENT.REVIEW:
          history.balance = new BigNumber(balance)
            .plus(history.amount)
            .toNumber();
          balance = history.balance;
          break;
        case CAMPAIGN_PAYMENT.TRANSFER:
        case CAMPAIGN_PAYMENT.TRANSFER_TO_GUEST:
          history.balance = new BigNumber(balance)
            .minus(history.amount)
            .toNumber();
          balance = history.balance;
          break;
      }
    }
    return histories.reverse();
  }
}
