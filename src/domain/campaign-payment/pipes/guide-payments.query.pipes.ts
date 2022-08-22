import { CP_REVIEW_TYPES, CP_TRANSFER_TYPES } from '../../../common/constants';
import {
  GetGuidesTotalPayedPipeInterface,
  GetHistoriesByUserPipeInterface,
  GetPayableByUserPipeInterface,
  GetPayablesPipeInterface,
  GetTotalGuideTotalPayablePipeInterface,
} from '../interface';
import { PipelineStage } from 'mongoose';

export const getPayablesPipe = ({
  guideName,
  payoutToken,
  payable,
  days,
}: GetPayablesPipeInterface): PipelineStage[] => {
  return [
    {
      $match: { guideName, payoutToken },
    },
    {
      $addFields: {
        subtractAmount: {
          $cond: [
            { $gte: [{ $subtract: ['$amount', '$votesAmount'] }, 0] },
            '$votesAmount',
            '$amount',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$userName',
        reviews: {
          $push: {
            $cond: [{ $in: ['$type', CP_REVIEW_TYPES] }, '$$ROOT', '$$REMOVE'],
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
            {
              $sum: [
                { $sum: '$transfers.amount' },
                { $sum: '$reviews.subtractAmount' },
              ],
            },
          ],
        },
      },
    },
    {
      $addFields: {
        notPayed: {
          $reduce: {
            input: { $reverseArray: '$reviews' },
            initialValue: { counter: '$payable', notPayedReviews: [] },
            in: {
              counter: {
                $subtract: ['$$value.counter', '$$this.amount'],
              },
              notPayedReviews: {
                $concatArrays: [
                  '$$value.notPayedReviews',
                  {
                    $cond: [{ $gt: ['$$value.counter', 0] }, ['$$this'], []],
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
                  $arrayElemAt: ['$notPayed.notPayedReviews.createdAt', -1],
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
  ];
};

export const getGuideTotalPayablePipe = ({
  guideName,
  payoutToken,
}: GetTotalGuideTotalPayablePipeInterface): PipelineStage[] => {
  return [
    {
      $match: { guideName, payoutToken },
    },
    {
      $addFields: {
        subtractAmount: {
          $cond: [
            { $gte: [{ $subtract: ['$amount', '$votesAmount'] }, 0] },
            '$votesAmount',
            '$amount',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$userName',
        reviews: {
          $push: {
            $cond: [{ $in: ['$type', CP_REVIEW_TYPES] }, '$$ROOT', '$$REMOVE'],
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
            {
              $sum: [
                { $sum: '$transfers.amount' },
                { $sum: '$reviews.subtractAmount' },
              ],
            },
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
  ];
};

export const getGuidesTotalPayedPipe = ({
  guideNames,
  payoutToken,
}: GetGuidesTotalPayedPipeInterface): PipelineStage[] => {
  return [
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
  ];
};

export const getPayableByUserPipe = ({
  guideName,
  payoutToken,
  userName,
}: GetPayableByUserPipeInterface): PipelineStage[] => {
  return [
    {
      $match: { guideName, payoutToken, userName },
    },
    {
      $addFields: {
        subtractAmount: {
          $cond: [
            { $gte: [{ $subtract: ['$amount', '$votesAmount'] }, 0] },
            '$votesAmount',
            '$amount',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$userName',
        reviews: {
          $push: {
            $cond: [{ $in: ['$type', CP_REVIEW_TYPES] }, '$$ROOT', '$$REMOVE'],
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
            {
              $sum: [
                { $sum: '$transfers.amount' },
                { $sum: '$reviews.subtractAmount' },
              ],
            },
          ],
        },
      },
    },
    {
      $addFields: {
        notPayed: {
          $reduce: {
            input: { $reverseArray: '$reviews' },
            initialValue: { counter: '$payable', notPayedReviews: [] },
            in: {
              counter: {
                $subtract: ['$$value.counter', '$$this.amount'],
              },
              notPayedReviews: {
                $concatArrays: [
                  '$$value.notPayedReviews',
                  {
                    $cond: [{ $gt: ['$$value.counter', 0] }, ['$$this'], []],
                  },
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        payable: { $convert: { input: '$payable', to: 'double' } },
        notPayedPeriod: {
          $cond: [
            { $gt: ['$payable', 0] },
            {
              $dateDiff: {
                startDate: {
                  $arrayElemAt: ['$notPayed.notPayedReviews.createdAt', -1],
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
  ];
};

export const getHistoriesByUserPipe = ({
  guideName,
  userName,
  payoutToken,
}: GetHistoriesByUserPipeInterface): PipelineStage[] => {
  return [
    {
      $match: { guideName, payoutToken, userName },
    },
    {
      $addFields: {
        subtractAmount: {
          $cond: [
            { $gte: [{ $subtract: ['$amount', '$votesAmount'] }, 0] },
            '$votesAmount',
            '$amount',
          ],
        },
      },
    },
    {
      $addFields: {
        commission: { $convert: { input: '$commission', to: 'double' } },
        amount: {
          $convert: {
            input: { $subtract: ['$amount', '$subtractAmount'] },
            to: 'double',
          },
        },
      },
    },
    { $sort: { createdAt: 1 } },
  ];
};
