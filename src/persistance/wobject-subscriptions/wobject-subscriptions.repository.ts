import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  WobjectSubscriptionsDocumentType,
  WobjectSubscriptionsFindType,
} from './types';
import { WobjectSubscriptions } from './wobject-subscriptions.schema';
import { WobjectSubscriptionsRepositoryInterface } from './interface';

export class WobjectSubscriptionsRepository
  implements WobjectSubscriptionsRepositoryInterface
{
  private readonly logger = new Logger(WobjectSubscriptionsRepository.name);
  constructor(
    @InjectModel(WobjectSubscriptions.name)
    private readonly model: Model<WobjectSubscriptionsDocumentType>,
  ) {}

  async find({
    filter,
    projection,
    options,
  }: WobjectSubscriptionsFindType): Promise<WobjectSubscriptions[]> {
    try {
      return this.model.find(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
  /*
    Domain
     */
  async findUserSubscriptions(
    userName: string,
  ): Promise<WobjectSubscriptions[]> {
    return this.find({ filter: { following: userName } });
  }
}
