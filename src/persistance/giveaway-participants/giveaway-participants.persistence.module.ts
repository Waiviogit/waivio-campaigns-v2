import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';

import {
  GiveawayParticipants,
  GiveawayParticipantsSchema,
} from './giveaway-participants.schema';
import { GiveawayParticipantsPersistenceProvider } from './giveaway-participants.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: GiveawayParticipants.name,
          schema: GiveawayParticipantsSchema,
          collection: COLLECTION.GIVEAWAY_PARTICIPANTS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [GiveawayParticipantsPersistenceProvider],
  exports: [GiveawayParticipantsPersistenceProvider],
})
export class GiveawayParticipantsPersistenceModule {}
