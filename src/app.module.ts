import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { configService } from './common/config';
import { CampaignModule } from './main/campaign/campaign.module';
import { CONNECTION_MONGO } from './common/constants';
import { RabbitmqModule } from './main/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forRoot(configService.getMongoWaivioConnectionString(), {
      connectionName: CONNECTION_MONGO.WAIVIO,
    }),
    CampaignModule,
    RabbitmqModule,
  ],
})
export class AppModule {}
