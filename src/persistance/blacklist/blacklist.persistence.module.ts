import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';

import { Blacklist, BlacklistSchema } from './blacklist.schema';
import { BlacklistPersistenceProvider } from './blacklist.persistence.provider';
import { BlacklistDocumentType } from './types';

@Module({
  imports: [
    MongooseModule.forFeatureAsync(
      [
        {
          name: Blacklist.name,
          collection: COLLECTION.BLACKLIST,
          useFactory: () => {
            const schema = BlacklistSchema;

            schema.pre<BlacklistDocumentType>('save', function () {
              this.whiteList = [this.user];
            });
            return schema;
          },
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [BlacklistPersistenceProvider],
  exports: [BlacklistPersistenceProvider],
})
export class BlacklistPersistenceModule {}
