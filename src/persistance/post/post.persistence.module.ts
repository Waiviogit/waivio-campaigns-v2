import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';

import { PostPersistenceProvider } from './post.persistence.provider';
import { Post, PostSchema } from './post.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Post.name,
          schema: PostSchema,
          collection: COLLECTION.POSTS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [PostPersistenceProvider],
  exports: [PostPersistenceProvider],
})
export class PostPersistenceModule {}
