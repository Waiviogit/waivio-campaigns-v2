import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { Module } from '@nestjs/common';
import { CONNECTION_MONGO, WAIVIO_MODELS } from '../../common/constants';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature(
      [WAIVIO_MODELS.CAMPAIGN],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  controllers: [CampaignController],
  providers: [CampaignService],
})
export class CampaignModule {}
