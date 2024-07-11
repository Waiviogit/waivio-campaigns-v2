import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';

import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';
import {
  CAMPAIGN_PAYMENT,
  CAMPAIGN_PAYMENT_PROVIDE,
  USER_PROVIDE,
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
import { UserRepositoryInterface } from '../../persistance/user/interface';
import { UserCampaignType } from '../../persistance/user/types';
import { ProcessedWobjectType } from '../wobject/types';

@Injectable()
export class GuidePaymentsQuery implements GuidePaymentsQueryInterface {
  constructor(
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPaymentRepository: CampaignPaymentRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  extractUsername(name: string): string {
    return name.slice(1);
  }
  findUserOrObject(
    item: string,
    isUser: boolean,
    campaignUsers: UserCampaignType[],
    objects: ProcessedWobjectType[],
  ): UserCampaignType | ProcessedWobjectType {
    return isUser
      ? campaignUsers.find((u) => u.name === this.extractUsername(item))
      : objects.find((o) => o.author_permlink === item);
  }
  isUser(item = ''): boolean {
    return item.startsWith('@');
  }

  getCampaignUsersFromArray(objects: string[]): string[] {
    return objects.reduce((acc, el) => {
      const user = el.startsWith('@');
      if (user) acc.push(el.slice(1));
      return acc;
    }, []);
  }

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
    sort,
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

    const sortFunc = {
      amount: (a, b) => b.payable - a.payable,
      time: (a, b) => a.notPayedDate - b.notPayedDate,
    };

    histories.sort(sortFunc[sort] || sortFunc.amount);

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

    const [campaignUsers, objects] = await Promise.all([
      this.userRepository.findCampaignsUsers(
        this.getCampaignUsersFromArray(links),
      ),
      this.wobjectHelper.getWobjectsForCampaigns({
        links,
        host,
      }),
    ]);

    const reviews: CampaignPaymentUserType[] =
      await this.campaignPaymentRepository.aggregate({
        pipeline: [
          {
            $match: {
              $and: [
                {
                  reservationPermlink: {
                    $in: _.map(histories, 'reservationPermlink'),
                  },
                },
                {
                  type: CAMPAIGN_PAYMENT.REVIEW,
                },
              ],
            },
          },
        ],
      });

    for (const history of histories) {
      if (
        _.includes(
          ['transfer', 'demo_debt', 'overpayment_refund', 'transferToGuest'],
          history.type,
        )
      ) {
        continue;
      }

      const reviewPayment = _.find(
        reviews,
        (payment) =>
          payment.reservationPermlink === history.reservationPermlink,
      );
      history.currentUser = history.userName;
      history.userName = _.get(reviewPayment, 'userName', null);

      const reviewObject = this.findUserOrObject(
        history.reviewObject,
        this.isUser(history.reviewObject),
        campaignUsers,
        objects,
      );

      const mainObject = this.findUserOrObject(
        history.mainObject,
        this.isUser(history.mainObject),
        campaignUsers,
        objects,
      );

      if (reviewObject) {
        history.reviewObject = history.reviewObject.startsWith('@')
          ? reviewObject
          : _.pick(reviewObject, ['name', 'defaultShowLink']);
      }

      if (mainObject) {
        history.mainObject = history.mainObject.startsWith('@')
          ? mainObject
          : _.pick(mainObject, ['name', 'defaultShowLink']);
      }
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
