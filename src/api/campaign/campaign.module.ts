import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { Module } from '@nestjs/common';
import { CONNECTION_MONGO, WAIVIO_MODELS } from '../../common/constants';
import { MongooseModule } from '@nestjs/mongoose';
import { DomainModule } from '../../domain/domain.module';

@Module({
  //remove
  imports: [
    MongooseModule.forFeature(
      [WAIVIO_MODELS.CAMPAIGN],
      CONNECTION_MONGO.WAIVIO,
    ),
    // DomainModule,
  ],
  controllers: [CampaignController],
  providers: [CampaignService],
})
export class CampaignModule {}
