import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';

import { CreateUpvoteType, SponsorsBotUpvoteDocumentType } from './type';
import { SponsorsBotUpvote } from './sponsors-bot-upvote.schema';
import { SponsorsBotUpvoteRepositoryInterface } from './interface';

@Injectable()
export class SponsorsBotUpvoteRepository
  implements SponsorsBotUpvoteRepositoryInterface
{
  private readonly logger = new Logger(SponsorsBotUpvoteRepository.name);
  constructor(
    @InjectModel(SponsorsBotUpvote.name)
    private readonly model: Model<SponsorsBotUpvoteDocumentType>,
  ) {}

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
}
