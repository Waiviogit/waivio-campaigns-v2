import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';

import { WobjectSubscriptionsDocumentType } from './types';
import { WobjectSubscriptions } from './wobject-subscriptions.schema';
import { MongoRepository } from '../mongo.repository';
import { WobjectSubscriptionsRepositoryInterface } from './interface';
import { Logger } from '@nestjs/common';

export class WobjectSubscriptionsRepository
  extends MongoRepository<WobjectSubscriptionsDocumentType>
  implements WobjectSubscriptionsRepositoryInterface
{
  constructor(
    @InjectModel(WobjectSubscriptions.name)
    protected readonly model: Model<WobjectSubscriptionsDocumentType>,
  ) {
    super(model, new Logger(WobjectSubscriptions.name));
  }

  async findUserSubscriptions(objectLink: string): Promise<string[]> {
    const subscriptions = await this.find({
      filter: { following: objectLink },
    });
    return _.map(subscriptions, 'follower');
  }
}
