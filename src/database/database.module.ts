import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { configService } from '../common/config';
import { CONNECTION_MONGO } from '../common/constants';

@Module({
  imports: [
    MongooseModule.forRoot(configService.getMongoWaivioConnectionString(), {
      connectionName: CONNECTION_MONGO.WAIVIO,
    }),
    MongooseModule.forRoot(configService.getMongoCurrenciesConnectionString(), {
      connectionName: CONNECTION_MONGO.CURRENCIES,
    }),
  ],
})
export class DatabaseModule {}
