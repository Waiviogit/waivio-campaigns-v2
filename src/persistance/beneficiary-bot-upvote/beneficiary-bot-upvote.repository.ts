import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';

import { COLLECTION } from '../../common/constants';
import { MongoRepository } from '../mongo.repository';
import { BeneficiaryBotUpvoteDocumentType } from './type/beneficiary-bot-upvote.types';
import { BeneficiaryBotUpvote } from './beneficiary-bot-upvote.schema';
import {
  CreateBeneficiaryUpvoteType,
  GetBeneficiaryUpvoteType,
  UpdateBeneficiaryStatusDataType,
  UpdateBeneficiaryStatusType,
} from './type/beneficiary-bot-upvote.repository.types';
import { BeneficiaryBotUpvoteRepositoryInterface } from './interface/beneficiary-bot-upvote.repository.interface';

@Injectable()
export class BeneficiaryBotUpvoteRepository
  extends MongoRepository<BeneficiaryBotUpvoteDocumentType>
  implements BeneficiaryBotUpvoteRepositoryInterface
{
  constructor(
    @InjectModel(BeneficiaryBotUpvote.name)
    protected readonly model: Model<BeneficiaryBotUpvoteDocumentType>,
  ) {
    super(model, new Logger(BeneficiaryBotUpvoteRepository.name));
  }

  async create(
    upvote: CreateBeneficiaryUpvoteType,
  ): Promise<BeneficiaryBotUpvoteDocumentType> {
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

  async getUpvotes(): Promise<GetBeneficiaryUpvoteType[]> {
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
            activationPermlink: '$upvote.activationPermlink',
            amountToVote: '$upvote.amountToVote',
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
  }: UpdateBeneficiaryStatusType): Promise<boolean> {
    try {
      const updateData: UpdateBeneficiaryStatusDataType = { $set: { status } };
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

  async calcVotesOnEvent(
    activationPermlink: string,
    eventDate: Date,
  ): Promise<number> {
    const [{ totalVotes = 0 } = {}] = await this.aggregate({
      pipeline: [
        { $match: { activationPermlink, eventDate } },
        { $group: { _id: null, totalVotes: { $sum: '$currentVote' } } },
      ],
    });
    return totalVotes;
  }

  async findBeneficiaryVotes({
    activationPermlink,
    eventDateStart,
    eventDateEnd,
    skip,
    limit,
  }: {
    activationPermlink: string;
    eventDateStart: Date;
    eventDateEnd: Date;
    skip: number;
    limit: number;
  }): Promise<BeneficiaryBotUpvoteDocumentType[]> {
    return this.find({
      filter: {
        activationPermlink,
        eventDate: {
          $gte: eventDateStart,
          $lte: eventDateEnd,
        },
      },
      options: {
        skip,
        limit,
        sort: { _id: -1 },
      },
    });
  }
}
