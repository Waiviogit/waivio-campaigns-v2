import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';
import { SponsorsBotPersistenceProvider } from './sponsors-bot.persistence.provider';
import { SponsorsBot, SponsorsBotSchema } from './sponsors-bot.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: SponsorsBot.name,
          schema: SponsorsBotSchema,
          collection: COLLECTION.SPONSORS_BOTS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [SponsorsBotPersistenceProvider],
  exports: [SponsorsBotPersistenceProvider],
})
export class SponsorsBotPersistenceModule {}
