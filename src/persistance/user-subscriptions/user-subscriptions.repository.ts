import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';

import { UserSubscriptions } from './user-subscriptions.schema';

import {
  UserSubscriptionsDocumentType,
  UserSubscriptionsFindType,
} from './types';
import { UserSubscriptionRepositoryInterface } from './interface';

export class UserSubscriptionsRepository
  implements UserSubscriptionRepositoryInterface
{
  private readonly logger = new Logger(UserSubscriptionsRepository.name);
  constructor(
    @InjectModel(UserSubscriptions.name)
    private readonly model: Model<UserSubscriptionsDocumentType>,
  ) {}

  async find({
    filter,
    projection,
    options,
  }: UserSubscriptionsFindType): Promise<UserSubscriptions[]> {
    try {
      return this.model.find(filter, projection, options).lean();
    } catch (error) {
      this.logger.error(error.message);
    }
  }
  /*
  Domain
   */
  async findUserSubscriptions(userName: string): Promise<string[]> {
    const subscriptions = await this.find({ filter: { following: userName } });
    return _.map(subscriptions, 'follower');
  }
}
