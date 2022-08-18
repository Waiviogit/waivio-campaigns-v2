import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';

import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';
import {
  CAMPAIGN_PAYMENT,
  CAMPAIGN_PAYMENT_PROVIDE,
  WOBJECT_PROVIDE,
} from '../../common/constants';
import {
  CampaignPaymentUserType,
  GetPayableAggregateType,
  GetPayablesOutType,
  GetPayableType,
  PayablesAllType,
  GetPayablesType,
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
  getGuideTotalPayablePipe,
} from './pipes';
import { WobjectHelperInterface } from '../wobject/interface';

@Injectable()
export class GuidePaymentsQuery implements GuidePaymentsQueryInterface {
  constructor(
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPaymentRepository: CampaignPaymentRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
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
    skip = 0,
    limit = 0,
  }: GetPayablesType): Promise<GetPayablesOutType> {
    const histories: PayablesAllType[] =
      await this.campaignPaymentRepository.aggregate({
        pipeline: getPayablesPipe({
          guideName,
          payoutToken,
          payable,
          days,
        }),
      });

    const totalPayable = await this.campaignPaymentRepository.aggregate({
      pipeline: getGuideTotalPayablePipe({ guideName, payoutToken }),
    });

    return {
      totalPayable: _.get(totalPayable, '[0].total', 0),
      histories: limit ? histories.slice(skip, skip + limit) : histories,
      hasMore: histories.slice(skip).length > limit,
    };
  }

  async getPayable({
    guideName,
    payoutToken,
    userName,
    host,
  }: GetPayableType): Promise<GetPayableOutType> {
    const histories = await this.getHistoriesByUser({
      guideName,
      payoutToken,
      userName,
    });

    const { payable: totalPayable, notPayedPeriod } =
      await this.getPayableByUser({
        guideName,
        payoutToken,
        userName,
      });

    const links = [
      ..._.map(histories, 'reviewObject'),
      ..._.map(histories, 'mainObject'),
    ];
    const objects = await this.wobjectHelper.getWobjectsForCampaigns({
      links,
      host,
    });

    for (const history of histories) {
      const reviewObject = _.pick(
        _.find(objects, (o) => o.author_permlink === history.reviewObject),
        ['name', 'defaultShowLink'],
      );
      const mainObject = _.pick(
        _.find(objects, (o) => o.author_permlink === history.mainObject),
        ['name', 'defaultShowLink'],
      );

      if (reviewObject) history.reviewObject = reviewObject;
      if (mainObject) history.mainObject = mainObject;
    }

    return { histories, totalPayable, notPayedPeriod };
  }

  async getPayableByUser({
    guideName,
    payoutToken,
    userName,
  }: GetPayableType): Promise<GetPayableAggregateType> {
    const payables: GetPayableAggregateType[] =
      await this.campaignPaymentRepository.aggregate({
        pipeline: getPayableByUserPipe({ guideName, userName, payoutToken }),
      });

    return payables[0];
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
