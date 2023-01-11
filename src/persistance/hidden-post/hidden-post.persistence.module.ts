import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';
import { HiddenPost, HiddenPostSchema } from './hidden-post.schema';
import { HiddenPostPersistenceProvider } from './hidden-post.persistence.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: HiddenPost.name,
          schema: HiddenPostSchema,
          collection: COLLECTION.HIDDEN_POST,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [HiddenPostPersistenceProvider],
  exports: [HiddenPostPersistenceProvider],
})
export class HiddenPostPersistenceModule {}
