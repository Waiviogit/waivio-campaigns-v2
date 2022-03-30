import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';
import { User, UserSchema } from './user.schema';
import { UserPersistenceProvider } from './user.persistence.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: User.name,
          schema: UserSchema,
          collection: COLLECTION.USERS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [UserPersistenceProvider],
  exports: [UserPersistenceProvider],
})
export class UserPersistenceModule {}
