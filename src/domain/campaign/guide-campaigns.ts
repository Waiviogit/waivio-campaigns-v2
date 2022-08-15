import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';

import {
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CURRENCY_RATES_PROVIDE,
  HIVE_ENGINE_PROVIDE,
  PAYOUT_TOKEN,
  SUPPORTED_CURRENCY,
} from '../../common/constants';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import {
  GuideManageCampaignType,
  GuideBalanceType,
  ReservedCampaigns,
  getInactiveCampaignsType,
  InactiveCampaignsType,
} from './types';
import { CurrencyRatesRepositoryInterface } from '../../persistance/currency-rates/interface';
import { CampaignHelperInterface, GuideCampaignsInterface } from './interface';
import { HiveEngineClientInterface } from '../../services/hive-engine-api/interface';
import { GuidePaymentsQueryInterface } from '../campaign-payment/interface';

@Injectable()
export class GuideCampaigns implements GuideCampaignsInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CURRENCY_RATES_PROVIDE.REPOSITORY)
    private readonly currencyRatesRepository: CurrencyRatesRepositoryInterface,
    @Inject(HIVE_ENGINE_PROVIDE.CLIENT)
    private readonly hiveEngineClient: HiveEngineClientInterface,
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.GUIDE_PAYMENTS_Q)
    private readonly guidePaymentsQuery: GuidePaymentsQueryInterface,
    @Inject(CAMPAIGN_PROVIDE.CAMPAIGN_HELPER)
    private readonly campaignHelper: CampaignHelperInterface,
  ) {}

  async addBudgetUsdToCampaigns(
    campaigns: GuideManageCampaignType[],
  ): Promise<GuideManageCampaignType[]> {
    const currencyRate = await this.currencyRatesRepository.findOne({
      filter: { base: SUPPORTED_CURRENCY.USD },
      options: { sort: { dateString: -1 } },
    });

    return campaigns.map((campaign) => ({
      ...campaign,
      budgetUSD:
        campaign.currency === SUPPORTED_CURRENCY.USD
          ? campaign.budget
          : new BigNumber(campaign.budget)
              .dividedBy(_.get(currencyRate, `rates.${campaign.currency}`))
              .toNumber(),
      payed: _.reduce(
        campaign.users,
        (acc, usr) => {
          if (usr.status === 'completed') {
            acc = new BigNumber(campaign.rewardInUSD)
              .div(usr.payoutTokenRateUSD)
              .plus(usr.rewardRaisedBy)
              .plus(acc)
              .dp(8)
              .toNumber();
          }
          return acc;
        },
        0,
      ),
    }));
  }

  async getInactiveCampaigns({
    guideName,
    skip,
    limit,
  }: getInactiveCampaignsType): Promise<InactiveCampaignsType> {
    const limitDate = moment.utc().startOf('month').toDate();
    const aggregationResult: GuideManageCampaignType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              guideName: guideName,
              status: {
                $nin: [CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.PENDING],
              },
            },
          },
          {
            $addFields: {
              completed: {
                $size: {
                  $filter: {
                    input: '$users',
                    as: 'user',
                    cond: {
                      $and: [
                        { $eq: ['$$user.status', 'completed'] },
                        { $gt: ['$$user.completedAt', limitDate] },
                      ],
                    },
                  },
                },
              },
              reserved: {
                $size: {
                  $filter: {
                    input: '$users',
                    as: 'user',
                    cond: {
                      $and: [
                        { $eq: ['$$user.status', 'assigned'] },
                        { $gt: ['$$user.createdAt', limitDate] },
                      ],
                    },
                  },
                },
              },
              completedTotal: {
                $size: {
                  $filter: {
                    input: '$users',
                    as: 'user',
                    cond: { $eq: ['$$user.status', 'completed'] },
                  },
                },
              },
            },
          },
          { $sort: { stoppedAt: -1 } },
          { $skip: skip },
          { $limit: limit + 1 },
          {
            $project: {
              name: 1,
              activationPermlink: 1,
              status: 1,
              type: 1,
              users: 1,
              budget: 1,
              reward: 1,
              rewardInUSD: 1,
              reserved: 1,
              completed: 1,
              completedTotal: 1,
              agreementObjects: 1,
              requiredObject: 1,
              requirements: 1,
              userRequirements: 1,
              expiredAt: '$stoppedAt',
              createdAt: 1,
              guideName: 1,
              currency: 1,
              commissionAgreement: 1,
              remaining: {
                $cond: [
                  { $eq: ['$status', 'active'] },
                  {
                    $subtract: [
                      { $divide: ['$budget', '$reward'] },
                      { $add: ['$completed', '$reserved'] },
                    ],
                  },
                  0,
                ],
              },
            },
          },
        ],
      });

    const campaigns = await this.addBudgetUsdToCampaigns(
      _.take(aggregationResult, limit),
    );
    return {
      campaigns,
      hasMore: aggregationResult.length > campaigns.length,
    };
  }

  async getActiveCampaigns(
    guideName: string,
  ): Promise<GuideManageCampaignType[]> {
    const limitDate = moment.utc().startOf('month').toDate();
    const campaigns: GuideManageCampaignType[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              guideName: guideName,
              status: {
                $in: [CAMPAIGN_STATUS.ACTIVE, CAMPAIGN_STATUS.PENDING],
              },
            },
          },
          {
            $addFields: {
              completed: {
                $size: {
                  $filter: {
                    input: '$users',
                    as: 'user',
                    cond: {
                      $and: [
                        { $eq: ['$$user.status', 'completed'] },
                        { $gt: ['$$user.completedAt', limitDate] },
                      ],
                    },
                  },
                },
              },
              reserved: {
                $size: {
                  $filter: {
                    input: '$users',
                    as: 'user',
                    cond: {
                      $and: [
                        { $eq: ['$$user.status', 'assigned'] },
                        { $gt: ['$$user.createdAt', limitDate] },
                      ],
                    },
                  },
                },
              },
              completedTotal: {
                $size: {
                  $filter: {
                    input: '$users',
                    as: 'user',
                    cond: { $eq: ['$$user.status', 'completed'] },
                  },
                },
              },
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $project: {
              name: 1,
              activationPermlink: 1,
              status: 1,
              type: 1,
              users: 1,
              budget: 1,
              reward: 1,
              rewardInUSD: 1,
              reserved: 1,
              completed: 1,
              completedTotal: 1,
              agreementObjects: 1,
              requiredObject: 1,
              requirements: 1,
              userRequirements: 1,
              expiredAt: 1,
              createdAt: 1,
              guideName: 1,
              currency: 1,
              commissionAgreement: 1,
              remaining: {
                $cond: [
                  { $eq: ['$status', 'active'] },
                  {
                    $subtract: [
                      { $divide: ['$budget', '$reward'] },
                      { $add: ['$completed', '$reserved'] },
                    ],
                  },
                  0,
                ],
              },
            },
          },
        ],
      });

    return this.addBudgetUsdToCampaigns(campaigns);
  }

  async getCampaignsReservedCount(
    guideName: string,
    payoutToken: string,
  ): Promise<ReservedCampaigns[]> {
    const limitDate = moment.utc().startOf('month').toDate();
    const campaigns: ReservedCampaigns[] =
      await this.campaignRepository.aggregate({
        pipeline: [
          {
            $match: {
              guideName,
              payoutToken,
            },
          },
          {
            $addFields: {
              reserved: {
                $size: {
                  $filter: {
                    input: '$users',
                    as: 'user',
                    cond: {
                      $and: [
                        { $eq: ['$$user.status', 'assigned'] },
                        { $gt: ['$$user.createdAt', limitDate] },
                      ],
                    },
                  },
                },
              },
            },
          },
          {
            $project: {
              reserved: 1,
              rewardInUSD: 1,
              commissionAgreement: 1,
            },
          },
        ],
      });
    return campaigns;
  }

  async getBalance(guideName: string): Promise<GuideBalanceType> {
    const symbol = PAYOUT_TOKEN.WAIV;
    const balance = await this.hiveEngineClient.getTokenBalance(
      guideName,
      symbol,
    );
    const { totalPayable } = await this.guidePaymentsQuery.getPayables({
      guideName,
      payoutToken: symbol,
    });
    const reserved = await this.getCampaignsReservedCount(guideName, symbol);

    const budgetTotal = {
      balance: Number(balance.balance),
      payable: totalPayable,
      reserved: _.sumBy(reserved, (campaign) => {
        if (campaign.reserved) {
          return (
            campaign.reserved * campaign.rewardInUSD +
            campaign.reserved *
              campaign.rewardInUSD *
              campaign.commissionAgreement
          );
        }
        return 0;
      }),
      remaining: 0,
    };

    // if there are reservations, you need to recalculate at the exchange rate to the dollar,
    // ideally this should be done taking into account the rate of each reservation,
    // but for now we take into account the current rate
    if (budgetTotal.reserved) {
      const usdRate = await this.campaignHelper.getPayoutTokenRateUSD(symbol);
      budgetTotal.reserved = usdRate
        ? budgetTotal.reserved / usdRate
        : budgetTotal.reserved;
    }

    budgetTotal.remaining = new BigNumber(budgetTotal.balance)
      .minus(budgetTotal.payable)
      .minus(budgetTotal.reserved)
      .toNumber();
    return budgetTotal;
  }
}
