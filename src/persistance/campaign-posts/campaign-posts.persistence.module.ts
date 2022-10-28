import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';
import { CampaignPost, CampaignPostsSchema } from './campaign-posts.schema';
import { CampaignPostsPersistenceProvider } from './campaign-posts.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: CampaignPost.name,
          schema: CampaignPostsSchema,
          collection: COLLECTION.CAMPAIGN_POSTS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [CampaignPostsPersistenceProvider],
  exports: [CampaignPostsPersistenceProvider],
})
export class CampaignPostsPersistenceModule {}
