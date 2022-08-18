import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { GetSingleReportInterface, PaymentReportInterface } from './interface';
import {
  CAMPAIGN_PAYMENT_PROVIDE,
  CAMPAIGN_PROVIDE,
  PAYOUT_TOKEN_PRECISION,
  USER_PROVIDE,
  WOBJECT_PROVIDE,
} from '../../common/constants';
import { CampaignPaymentRepositoryInterface } from '../../persistance/campaign-payment/interface';
import { CampaignRepositoryInterface } from '../../persistance/campaign/interface';
import { UserRepositoryInterface } from '../../persistance/user/interface';

import { WobjectHelperInterface } from '../wobject/interface';
import { sumBy } from '../../common/helpers/calc-helper';
import BigNumber from 'bignumber.js';
import { CampaignPaymentDocumentType } from '../../persistance/campaign-payment/types';
import { SingleReportType } from './types';

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
  ) {}

  async getSingleReport({
    userName,
    guideName,
    reviewPermlink,
    host,
    payoutToken,
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
          { $match: { reviewPermlink: reviewPermlink, payoutToken } },
          {
            $addFields: {
              payableInUSD: {
                $convert: {
                  input: {
                    $multiply: [
                      { $sum: ['$amount', '$votesAmount'] },
                      reservation.payoutTokenRateUSD,
                    ],
                  },
                  to: 'double',
                },
              },
              amount: { $convert: { input: '$amount', to: 'double' } },
              commission: { $convert: { input: '$commission', to: 'double' } },
            },
          },
        ],
      });
    if (!users.length || !campaign || !histories.length) return;

    const rewards = _.filter(histories, (history) =>
      _.includes(['beneficiary_fee', 'review'], history.type),
    );

    let rewardTokenAmount = sumBy({
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

    if (rewardRecord.voteAmount) {
      rewardTokenAmount = new BigNumber(rewardTokenAmount)
        .plus(
          sumBy({
            arr: rewards,
            callback: (reward) => _.get(reward, 'votesAmount', 0),
          }),
        )
        .dp(PAYOUT_TOKEN_PRECISION[payoutToken])
        .toNumber();
    }

    const { requiredObject, secondaryObject } =
      await this.wobjectHelper.getRequiredAndSecondaryObjects({
        requiredPermlink: campaign.requiredObject,
        secondaryPermlink: reservation.objectPermlink,
        host,
      });

    const sponsor = _.find(users, (usr) => usr.name === guideName);
    const user = _.find(users, (usr) => usr.name === userName);
    console.log();
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
      rewardTokenAmount,
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
}
