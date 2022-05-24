import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';

import {
  SponsorsBotUpvote,
  SponsorsBotUpvoteSchema,
} from './sponsors-bot-upvote.schema';
import { SponsorsBotUpvotePersistenceProvider } from './sponsors-bot-upvote.persistence.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: SponsorsBotUpvote.name,
          schema: SponsorsBotUpvoteSchema,
          collection: COLLECTION.SPONSORS_BOT_UPVOTE,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [SponsorsBotUpvotePersistenceProvider],
  exports: [SponsorsBotUpvotePersistenceProvider],
})
export class SponsorsBotUpvotePersistenceModule {}
