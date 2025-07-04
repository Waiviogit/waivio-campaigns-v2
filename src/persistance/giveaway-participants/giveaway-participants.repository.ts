import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';

import { WobjectSubscriptions } from './giveaway-participants.schema';
import { WobjectSubscriptionsRepositoryInterface } from './interface';

export class GiveawayParticipantsRepository
  implements WobjectSubscriptionsRepositoryInterface
{
  private readonly logger = new Logger(GiveawayParticipantsRepository.name);
  constructor(
    @InjectModel(WobjectSubscriptions.name)
    private readonly model: Model<WobjectSubscriptionsDocumentType>,
  ) {}

  async find({
    filter,
    projection,
    options,
  }: WobjectSubscriptionsFindType): Promise<
    WobjectSubscriptionsDocumentType[]
  > {
    try {
      return this.model.find(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
  /*
    Domain
     */
  async findUserSubscriptions(objectLink: string): Promise<string[]> {
    const subscriptions = await this.find({
      filter: { following: objectLink },
    });
    return _.map(subscriptions, 'follower');
  }
}
