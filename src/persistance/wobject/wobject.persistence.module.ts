import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';
import { Wobject, WobjectSchema } from './wobject.schema';
import { WobjectPersistenceProvider } from './wobject.persistence.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Wobject.name,
          schema: WobjectSchema,
          collection: COLLECTION.WOBJECTS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [WobjectPersistenceProvider],
  exports: [WobjectPersistenceProvider],
})
export class WobjectPersistenceModule {}
