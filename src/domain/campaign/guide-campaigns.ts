import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';

import {
  CAMPAIGN_PROVIDE,
  CAMPAIGN_STATUS,
  CURRENCY_RATES_PROVIDE,
  SUPPORTED_CURRENCY,
} from '../../common/constants';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { GuideActiveCampaignType } from './types';
import { CurrencyRatesRepositoryInterface } from '../../persistance/currency-rates/interface';
import { GuideCampaignsInterface } from './interface';

@Injectable()
export class GuideCampaigns implements GuideCampaignsInterface {
  constructor(
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(CURRENCY_RATES_PROVIDE.REPOSITORY)
    private readonly currencyRatesRepository: CurrencyRatesRepositoryInterface,
  ) {}

  async getActiveCampaigns(
    guideName: string,
  ): Promise<GuideActiveCampaignType[]> {
    const limitDate = moment.utc().startOf('month').toDate();
    const campaigns: GuideActiveCampaignType[] =
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

    const currencyRate = this.currencyRatesRepository.findOne({
      filter: { base: SUPPORTED_CURRENCY.USD },
      options: { sort: { dateString: -1 } },
    });

    for (const campaign of campaigns) {
      campaign.budgetUSD =
        campaign.currency === SUPPORTED_CURRENCY.USD
          ? campaign.budget
          : new BigNumber(campaign.budget)
              .dividedBy(_.get(currencyRate, `rates.${campaign.currency}`))
              .toNumber();
    }
    return campaigns;
  }
}
