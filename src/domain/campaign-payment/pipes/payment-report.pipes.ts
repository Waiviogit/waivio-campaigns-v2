import { PipelineStage } from 'mongoose';
import * as _ from 'lodash';
import { CAMPAIGN_PAYMENT } from '../../../common/constants';
import { getGlobalReportPipeInterface } from '../interface';

export const getGlobalReportPipe = ({
  guideName,
  payoutToken,
  processingFees,
  objects,
  startDate,
  endDate,
}: getGlobalReportPipeInterface): PipelineStage[] => {
  return [
    {
      $match: {
        guideName,
        payoutToken,
        type: processingFees
          ? {
              $in: [
                CAMPAIGN_PAYMENT.REVIEW,
                CAMPAIGN_PAYMENT.CAMPAIGNS_SERVER_FEE,
                CAMPAIGN_PAYMENT.REFERRAL_SERVER_FEE,
                CAMPAIGN_PAYMENT.BENEFICIARY_FEE,
                CAMPAIGN_PAYMENT.INDEX_FEE,
              ],
            }
          : {
              $in: [CAMPAIGN_PAYMENT.REVIEW, CAMPAIGN_PAYMENT.BENEFICIARY_FEE],
            },
        $and: [
          { createdAt: { $gt: startDate } },
          { createdAt: { $lt: endDate } },
        ],
        ...(!_.isEmpty(objects) && {
          $or: [
            { reviewObject: { $in: objects } },
            { mainObject: { $in: objects } },
          ],
        }),
      },
    },
    { $sort: { type: 1 } },
    {
      $group: {
        _id: '$reservationPermlink',
        amount: {
          $sum: {
            //votesAmount?
            $sum: ['$amount', '$votesAmount'],
          },
        },
        type: { $last: '$type' },
        createdAt: { $last: '$createdAt' },
        userName: { $last: '$userName' },
        guideName: { $last: '$guideName' },
        payoutTokenRateUSD: { $last: '$payoutTokenRateUSD' },
        mainObject: { $last: '$mainObject' },
        reviewObject: { $last: '$reviewObject' },
        title: { $last: '$title' },
        reservationPermlink: { $last: '$reservationPermlink' },
        reviewPermlink: { $last: '$reviewPermlink' },
        beneficiaries: { $last: '$beneficiaries' },
        payoutToken: { $last: '$payoutToken' },
      },
    },
    { $sort: { createdAt: 1 } },
    {
      $addFields: {
        payableInDollars: {
          $convert: {
            input: {
              $multiply: ['$amount', '$payoutTokenRateUSD'],
            },
            to: 'double',
          },
        },
        amount: { $convert: { $input: '$amount', to: 'double' } },
      },
    },
  ];
};
