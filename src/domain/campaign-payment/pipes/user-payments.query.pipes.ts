import {
  getUserPayablesPipeInterface,
  GetUserTotalPayablePipeInterface,
} from '../interface';
import { PipelineStage } from 'mongoose';
import { CP_REVIEW_TYPES, CP_TRANSFER_TYPES } from '../../../common/constants';

export const getUserPayablesPipe = ({
  userName,
  payoutToken,
  payable,
  days,
}: getUserPayablesPipeInterface): PipelineStage[] => {
  return [
    {
      $match: { userName, payoutToken },
    },
    {
      $group: {
        _id: '$guideName',
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
            { $sum: '$transfers.amount' },
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
        guideName: '$_id',
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

export const getUserTotalPayablePipe = ({
  userName,
  payoutToken,
}: GetUserTotalPayablePipeInterface): PipelineStage[] => {
  return [
    {
      $match: { userName, payoutToken },
    },
    {
      $group: {
        _id: '$guideName',
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
  ];
};
