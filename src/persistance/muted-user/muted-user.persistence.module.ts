import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';
import { MutedUserPersistenceProvider } from './muted-user.persistence.provider';
import { MutedUser, MutedUserSchema } from './muted-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: MutedUser.name,
          schema: MutedUserSchema,
          collection: COLLECTION.MUTED_USERS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [MutedUserPersistenceProvider],
  exports: [MutedUserPersistenceProvider],
})
export class MutedUserPersistenceModule {}
