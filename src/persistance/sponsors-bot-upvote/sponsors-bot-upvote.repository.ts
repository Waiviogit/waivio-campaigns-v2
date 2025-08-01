import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import * as moment from 'moment';

import {
  CreateUpvoteType,
  GetUpvoteType,
  SponsorsBotUpvoteDocumentType,
  UpdateStatusDataType,
  UpdateStatusType,
} from './type';
import { SponsorsBotUpvote } from './sponsors-bot-upvote.schema';
import { SponsorsBotUpvoteRepositoryInterface } from './interface';
import { COLLECTION } from '../../common/constants';
import { MongoRepository } from '../mongo.repository';

@Injectable()
export class SponsorsBotUpvoteRepository
  extends MongoRepository<SponsorsBotUpvoteDocumentType>
  implements SponsorsBotUpvoteRepositoryInterface
{
  constructor(
    @InjectModel(SponsorsBotUpvote.name)
    protected readonly model: Model<SponsorsBotUpvoteDocumentType>,
  ) {
    super(model, new Logger(SponsorsBotUpvoteRepository.name));
  }

  async create(
    upvote: CreateUpvoteType,
  ): Promise<SponsorsBotUpvoteDocumentType> {
    try {
      return this.model.create({
        ...upvote,
        startedAt: moment.utc().add(30, 'minutes'),
        expiredAt: moment.utc().add(7, 'days'),
      });
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async getUpvotes(): Promise<GetUpvoteType[]> {
    try {
      return this.model.aggregate([
        { $group: { _id: '$botName', upvotes: { $push: '$$ROOT' } } },
        {
          $addFields: {
            upvote: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$upvotes',
                    as: 'upvote',
                    cond: {
                      $and: [
                        { $eq: ['$$upvote.status', 'pending'] },
                        { $lte: ['$$upvote.startedAt', moment.utc().toDate()] },
                        {
                          $gte: [
                            '$$upvote.expiredAt',
                            moment.utc().subtract(30, 'minutes').toDate(),
                          ],
                        },
                      ],
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $lookup: {
            from: COLLECTION.SPONSORS_BOTS,
            localField: '_id',
            foreignField: 'botName',
            as: 'bot',
          },
        },
        { $unwind: '$bot' },
        {
          $addFields: {
            sponsor: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$bot.sponsors',
                    as: 'sponsor',
                    cond: {
                      $eq: ['$$sponsor.sponsor', '$upvote.sponsor'],
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        { $match: { 'sponsor.enabled': true } },
        {
          $project: {
            _id: '$upvote._id',
            botName: '$bot.botName',
            sponsor: '$sponsor.sponsor',
            votingPercent: '$sponsor.votingPercent',
            minVotingPower: '$bot.minVotingPower',
            symbol: '$upvote.symbol',
            author: '$upvote.author',
            permlink: '$upvote.permlink',
            reward: '$upvote.reward',
            totalVotesWeight: '$upvote.totalVotesWeight',
            requiredObject: '$upvote.requiredObject',
            amountToVote: '$upvote.amountToVote',
            reservationPermlink: '$upvote.reservationPermlink',
          },
        },
      ]);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async updateStatus({
    _id,
    status,
    currentVote,
    voteWeight,
  }: UpdateStatusType): Promise<boolean> {
    try {
      const updateData: UpdateStatusDataType = { $set: { status } };
      if (currentVote) updateData.$set.currentVote = currentVote;
      if (voteWeight) updateData.$set.voteWeight = voteWeight;
      const result = await this.model.updateOne({ _id }, updateData, {
        runValidators: true,
      });

      return !!result.modifiedCount;
    } catch (error) {
      return false;
    }
  }
}
