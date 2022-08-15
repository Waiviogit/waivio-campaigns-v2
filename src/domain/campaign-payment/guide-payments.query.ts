import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';

import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';
import {
  CAMPAIGN_PAYMENT,
  CAMPAIGN_PAYMENT_PROVIDE,
  CP_REVIEW_TYPES,
  CP_TRANSFER_TYPES,
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
        pipeline: [
          {
            $match: { guideName: { $in: guideNames }, payoutToken },
          },
          {
            $group: {
              _id: '$guideName',
              transfers: {
                $push: {
                  $cond: [
                    { $in: ['$type', CP_TRANSFER_TYPES] },
                    '$$ROOT',
                    '$$REMOVE',
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              payed: { $sum: '$transfers.amount' },
            },
          },
          {
            $project: {
              payed: { $convert: { input: '$payed', to: 'double' } },
              guideName: '$_id',
            },
          },
        ],
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
        pipeline: [
          {
            $match: { guideName, payoutToken },
          },
          {
            $group: {
              _id: '$userName',
              reviews: {
                $push: {
                  $cond: [
                    { $in: ['$type', CP_REVIEW_TYPES] },
                    '$$ROOT',
                    '$$REMOVE',
                  ],
                },
              },
              transfers: {
                $push: {
                  $cond: [
                    { $in: ['$type', CP_TRANSFER_TYPES] },
                    '$$ROOT',
                    '$$REMOVE',
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              payable: {
                $subtract: [
                  { $sum: '$reviews.amount' },
                  { $sum: '$transfers.amount' },
                ],
              },
            },
          },
          {
            $addFields: {
              notPayed: {
                $reduce: {
                  input: '$reviews',
                  initialValue: { counter: '$payable', notPayedReviews: [] },
                  in: {
                    counter: {
                      $subtract: ['$$value.counter', '$$this.amount'],
                    },
                    notPayedReviews: {
                      $concatArrays: [
                        '$$value.notPayedReviews',
                        {
                          $cond: [
                            { $gte: ['$$value.counter', 0] },
                            ['$$this'],
                            [],
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: 'name',
              as: 'user',
            },
          },
          { $addFields: { alias: { $arrayElemAt: ['$user.alias', 0] } } },
          {
            $project: {
              _id: 0,
              userName: '$_id',
              payable: { $convert: { input: '$payable', to: 'double' } },
              alias: 1,
              notPayedDate: {
                $cond: [
                  { $gt: ['$payable', 0] },
                  { $arrayElemAt: ['$notPayed.notPayedReviews.createdAt', -1] },
                  new Date(),
                ],
              },
              notPayedPeriod: {
                $cond: [
                  { $gt: ['$payable', 0] },
                  {
                    $dateDiff: {
                      startDate: {
                        $arrayElemAt: [
                          '$notPayed.notPayedReviews.createdAt',
                          -1,
                        ],
                      },
                      endDate: new Date(),
                      unit: 'day',
                    },
                  },
                  0,
                ],
              },
            },
          },
          {
            $match: {
              ...(days && { notPayedPeriod: { $gte: days } }),
              ...(payable && { payable: { $gte: payable } }),
            },
          },
        ],
      });

    const totalPayable = await this.campaignPaymentRepository.aggregate({
      pipeline: [
        {
          $match: { guideName, payoutToken },
        },
        {
          $group: {
            _id: '$userName',
            reviews: {
              $push: {
                $cond: [
                  { $in: ['$type', CP_REVIEW_TYPES] },
                  '$$ROOT',
                  '$$REMOVE',
                ],
              },
            },
            transfers: {
              $push: {
                $cond: [
                  { $in: ['$type', CP_TRANSFER_TYPES] },
                  '$$ROOT',
                  '$$REMOVE',
                ],
              },
            },
          },
        },
        {
          $addFields: {
            payable: {
              $subtract: [
                { $sum: '$reviews.amount' },
                { $sum: '$transfers.amount' },
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$payable' },
          },
        },
        {
          $project: {
            total: { $convert: { input: '$total', to: 'double' } },
          },
        },
      ],
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
        pipeline: [
          {
            $match: { guideName, payoutToken, userName },
          },
          {
            $group: {
              _id: '$userName',
              reviews: {
                $push: {
                  $cond: [
                    { $in: ['$type', CP_REVIEW_TYPES] },
                    '$$ROOT',
                    '$$REMOVE',
                  ],
                },
              },
              transfers: {
                $push: {
                  $cond: [
                    { $in: ['$type', CP_TRANSFER_TYPES] },
                    '$$ROOT',
                    '$$REMOVE',
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              payable: {
                $subtract: [
                  { $sum: '$reviews.amount' },
                  { $sum: '$transfers.amount' },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              payable: { $convert: { input: '$payable', to: 'double' } },
            },
          },
        ],
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
        pipeline: [
          {
            $match: { guideName, payoutToken, userName },
          },
          {
            $addFields: {
              commission: { $convert: { input: '$commission', to: 'double' } },
              amount: { $convert: { input: '$amount', to: 'double' } },
            },
          },
          { $sort: { createdAt: 1 } },
        ],
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
