import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';
import { App, AppSchema } from './app.schema';
import { AppPersistenceProvider } from './app.persistence.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: App.name,
          schema: AppSchema,
          collection: COLLECTION.APPS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [AppPersistenceProvider],
  exports: [AppPersistenceProvider],
})
export class AppPersistenceModule {}
