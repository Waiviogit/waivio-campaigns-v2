import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { configService } from './common/config';
import { CampaignModule } from './api/campaign/campaign.module';
import { CONNECTION_MONGO } from './common/constants';
import { RabbitmqModule } from './services/rabbitmq/rabbitmq.module';
import { PersistenceModule } from './persistance/presistance.module';
import { DomainModule } from './domain/domain.module';

@Module({
  imports: [
    MongooseModule.forRoot(configService.getMongoWaivioConnectionString(), {
      connectionName: CONNECTION_MONGO.WAIVIO,
    }),
    PersistenceModule,
      // DomainModule,
    CampaignModule,
    RabbitmqModule,
  ],
})
export class AppModule {}
