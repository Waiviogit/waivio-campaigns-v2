import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';
import {
  BeneficiaryBotUpvote,
  BeneficiaryBotUpvoteSchema,
} from './beneficiary-bot-upvote.schema';
import { BeneficiaryBotUpvotePersistenceProvider } from './beneficiary-bot-upvote.persistence.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: BeneficiaryBotUpvote.name,
          schema: BeneficiaryBotUpvoteSchema,
          collection: COLLECTION.BENEFICIARY_BOT_UPVOTES,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [BeneficiaryBotUpvotePersistenceProvider],
  exports: [BeneficiaryBotUpvotePersistenceProvider],
})
export class BeneficiaryBotUpvotePersistenceModule {}
