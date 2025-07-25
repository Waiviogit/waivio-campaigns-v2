import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';

import { UserSubscriptions } from './user-subscriptions.schema';

import { UserSubscriptionsDocumentType } from './types';
import { UserSubscriptionRepositoryInterface } from './interface';
import { MongoRepository } from '../mongo.repository';

export class UserSubscriptionsRepository
  extends MongoRepository<UserSubscriptionsDocumentType>
  implements UserSubscriptionRepositoryInterface
{
  constructor(
    @InjectModel(UserSubscriptions.name)
    protected readonly model: Model<UserSubscriptionsDocumentType>,
  ) {
    super(model, new Logger(UserSubscriptionsRepository.name));
  }
  async findUserSubscriptions(userName: string): Promise<string[]> {
    const subscriptions = await this.find({ filter: { following: userName } });
    return _.map(subscriptions, 'follower');
  }
}
