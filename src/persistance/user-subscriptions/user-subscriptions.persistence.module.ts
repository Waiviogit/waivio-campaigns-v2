import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';

import {
  UserSubscriptions,
  UserSubscriptionsSchema,
} from './user-subscriptions.schema';
import { UserSubscriptionsPersistenceProvider } from './user-subscriptions.persistence.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: UserSubscriptions.name,
          schema: UserSubscriptionsSchema,
          collection: COLLECTION.USER_SUBSCRIPTIONS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [UserSubscriptionsPersistenceProvider],
  exports: [UserSubscriptionsPersistenceProvider],
})
export class UserSubscriptionsPersistenceModule {}
