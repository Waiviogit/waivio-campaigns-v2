import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import * as moment from 'moment';
import {
  GetBeneficiaryVotesInterface,
  GetGlobalReportInterface,
  GetSingleReportInterface,
  PaymentReportInterface,
} from './interface';
import {
  BENEFICIARY_BOT_UPVOTE_PROVIDE,
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_PROVIDE,
  CURRENCY_RATES_PROVIDE,
  PAYOUT_TOKEN_PRECISION,
  USER_PROVIDE,
  WOBJECT_PROVIDE,
} from '../../common/constants';
import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { UserRepositoryInterface } from '../../persistance/user/interface';
import { BeneficiaryBotUpvoteRepositoryInterface } from '../../persistance/beneficiary-bot-upvote/interface/beneficiary-bot-upvote.repository.interface';

import { WobjectHelperInterface } from '../wobject/interface';
import { sumBy } from '../../common/helpers/calc-helper';
import BigNumber from 'bignumber.js';
import { CampaignPaymentDocumentType } from '../../persistance/campaign-payment/types';
import {
  BeneficiaryVotesType,
  GlobalPaymentType,
  GlobalReportType,
  SingleReportType,
} from './types';
import { getGlobalReportPipe } from './pipes';
import { CurrencyRatesHelperInterface } from '../currency-rates/interface';

@Injectable()
export class PaymentReport implements PaymentReportInterface {
  constructor(
    @Inject(CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY)
    private readonly campaignPaymentRepository: CampaignPaymentRepositoryInterface,
    @Inject(CAMPAIGN_PROVIDE.REPOSITORY)
    private readonly campaignRepository: CampaignRepositoryInterface,
    @Inject(USER_PROVIDE.REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(WOBJECT_PROVIDE.HELPER)
    private readonly wobjectHelper: WobjectHelperInterface,
    @Inject(CURRENCY_RATES_PROVIDE.HELPER)
    private readonly currencyRatesHelper: CurrencyRatesHelperInterface,
    @Inject(BENEFICIARY_BOT_UPVOTE_PROVIDE.REPOSITORY)
    private readonly beneficiaryBotUpvoteRepository: BeneficiaryBotUpvoteRepositoryInterface,
  ) {}

  async getGlobalReport({
    guideName,
    payoutToken,
    host,
    startDate,
    endDate,
    payable,
    limit,
    skip,
    objects,
    processingFees,
    currency,
  }: GetGlobalReportInterface): Promise<GlobalReportType> {
    let payables = 0,
      amount = 0;
    let histories: GlobalPaymentType[] = [];
    histories = await this.campaignPaymentRepository.aggregate({
      pipeline: getGlobalReportPipe({
        payoutToken,
        guideName,
        objects,
        processingFees,
        startDate,
        endDate,
      }),
    });

    const processedObjects = await this.wobjectHelper.getWobjectsForCampaigns({
      links: [
        ..._.map(histories, 'reviewObject'),
        ..._.map(histories, 'mainObject'),
      ],
      host,
    });

    const rates = await this.currencyRatesHelper.getCurrencyRates({
      collection: histories,
      currency,
      pathTimestamp: 'createdAt',
      momentCallback: moment,
    });

    for (const history of histories) {
      const reviewObject = _.pick(
        _.find(
          processedObjects,
          (o) => o.author_permlink === history.reviewObject,
        ),
        ['name', 'defaultShowLink'],
      );
      const mainObject = _.pick(
        _.find(
          processedObjects,
          (o) => o.author_permlink === history.mainObject,
        ),
        ['name', 'defaultShowLink'],
      );

      if (reviewObject) history.reviewObject = reviewObject;
      if (mainObject) history.mainObject = mainObject;
      history.amount = this.currencyRatesHelper.getCurrencyAmount({
        history,
        rates,
        currency,
      });
    }

    for (const history of histories) {
      history.balance = new BigNumber(payables).plus(history.amount).toNumber();
      payables = history.balance;
      amount = new BigNumber(amount).plus(history.amount).toNumber();
    }
    _.reverse(histories);
    if (payable && amount > payable) {
      histories = this.filterByPayable(histories, payable);
    }

    return {
      histories: histories.slice(skip, limit + skip),
      hasMore: histories.slice(skip).length > limit,
    };
  }

  filterByPayable(
    histories: GlobalPaymentType[],
    amount: number,
  ): GlobalPaymentType[] {
    let counter = 0;
    let currentAmount = 0;
    const filtered = [];
    _.reverse(histories);
    while (currentAmount <= amount) {
      if (
        currentAmount + histories[counter].amount > amount &&
        filtered.length
      ) {
        break;
      }
      currentAmount += histories[counter].amount;
      histories[counter].balance = currentAmount;
      filtered.unshift(histories[counter]);
      counter++;
    }
    return filtered;
  }

  async getSingleReport({
    userName,
    guideName,
    reviewPermlink,
    host,
    payoutToken,
    reservationPermlink,
  }: GetSingleReportInterface): Promise<SingleReportType> {
    const users = await this.userRepository.find({
      filter: { name: { $in: [userName, guideName] } },
    });
    const campaign = await this.campaignRepository.findOne({
      filter: { 'users.reviewPermlink': reviewPermlink },
    });

    const reservation = _.find(
      campaign?.users,
      (u) => u.reviewPermlink === reviewPermlink,
    );

    const histories: CampaignPaymentDocumentType[] =
      await this.campaignPaymentRepository.aggregate({
        pipeline: [
          {
            $match: {
              reviewPermlink,
              payoutToken,
              reservationPermlink,
            },
          },
          {
            $addFields: {
              payableInUSD: {
                $convert: {
                  input: {
                    $multiply: ['$amount', reservation.payoutTokenRateUSD],
                  },
                  to: 'double',
                },
              },
              amount: {
                $convert: {
                  input: { $subtract: ['$amount', '$votesAmount'] },
                  to: 'double',
                },
              },
              commission: { $convert: { input: '$commission', to: 'double' } },
              votesAmount: {
                $convert: { input: '$votesAmount', to: 'double' },
              },
            },
          },
        ],
      });
    if (!users.length || !campaign || !histories.length) return;

    const rewards = _.filter(histories, (history) =>
      _.includes(['beneficiaryFee', 'review'], history.type),
    );

    const rewardTokenAmount = sumBy({
      arr: rewards,
      callback: (reward) => _.get(reward, 'amount', 0),
      dp: PAYOUT_TOKEN_PRECISION[payoutToken],
    });

    const rewardUsd = sumBy({
      arr: rewards,
      callback: (reward) => _.get(reward, 'payableInUSD', 0),
    });

    const rewardRecord = _.find(
      histories,
      (history) => history.type === 'review',
    );

    const rewardTokenAmountPlusVotes = new BigNumber(rewardTokenAmount)
      .plus(
        sumBy({
          arr: rewards,
          callback: (reward) => _.get(reward, 'votesAmount', 0),
          dp: PAYOUT_TOKEN_PRECISION[payoutToken],
        }),
      )
      .toNumber();

    const { requiredObject, secondaryObject } =
      await this.wobjectHelper.getRequiredAndSecondaryObjects({
        requiredPermlink: campaign.requiredObject,
        secondaryPermlink: reservation.objectPermlink,
        host,
      });

    const sponsor = _.find(users, (usr) => usr.name === guideName);
    const user = _.find(users, (usr) => usr.name === userName);

    return {
      matchBots: campaign.matchBots,
      createCampaignDate: _.get(campaign, 'createdAt', ''),
      reservationDate: _.get(reservation, 'createdAt', ''),
      reviewDate: _.get(rewardRecord, 'createdAt', ''),
      title: _.get(rewardRecord, 'title', ''),
      activationPermlink: campaign.activationPermlink,
      reservationPermlink: _.get(reservation, 'reservationPermlink', ''),
      requiredObject,
      secondaryObject,
      rewardTokenAmount: rewardTokenAmountPlusVotes,
      rewardUsd,
      histories,
      sponsor: _.pick(sponsor, [
        'name',
        'wobjects_weight',
        'alias',
        'json_metadata',
      ]),
      user: _.pick(user, ['name', 'wobjects_weight', 'alias', 'json_metadata']),
    };
  }

  async getBeneficiaryVotes({
    campaignId,
    createdAt,
    skip,
    limit,
  }: GetBeneficiaryVotesInterface): Promise<BeneficiaryVotesType> {
    const campaign = await this.campaignRepository.findCampaignById(campaignId);
    if (!campaign || !campaign.activationPermlink) {
      return { result: [], hasMore: false };
    }

    const createdAtDate = moment(createdAt).toDate();
    const eventDateStart = moment(createdAtDate)
      .subtract(2, 'minutes')
      .toDate();
    const eventDateEnd = moment(createdAtDate).add(2, 'minutes').toDate();

    const result =
      await this.beneficiaryBotUpvoteRepository.findBeneficiaryVotes({
        activationPermlink: campaign.activationPermlink,
        eventDateStart,
        eventDateEnd,
        skip,
        limit: limit + 1,
      });

    const hasMore = result.length > limit;
    const finalResult = hasMore ? result.slice(0, limit) : result;

    return {
      result: finalResult,
      hasMore,
    };
  }
}
