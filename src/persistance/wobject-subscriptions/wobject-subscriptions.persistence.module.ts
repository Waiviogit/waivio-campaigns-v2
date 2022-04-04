import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';

import { WobjectSubscriptionsPersistenceProvider } from './wobject-subscriptions.provider';
import {
  WobjectSubscriptions,
  WobjectSubscriptionsSchema,
} from './wobject-subscriptions.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: WobjectSubscriptions.name,
          schema: WobjectSubscriptionsSchema,
          collection: COLLECTION.WOBJECT_SUBSCRIPTIONS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [WobjectSubscriptionsPersistenceProvider],
  exports: [WobjectSubscriptionsPersistenceProvider],
})
export class WobjectSubscriptionsPersistenceModule {}
