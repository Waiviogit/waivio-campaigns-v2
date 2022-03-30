import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignPersistenceProvider } from './campaign.persistence.provider';
import { Campaign, CampaignSchema } from './campaign.schema';
import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Campaign.name,
          schema: CampaignSchema,
          collection: COLLECTION.CAMPAIGNS,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [CampaignPersistenceProvider],
  exports: [CampaignPersistenceProvider],
})
export class CampaignPersistenceModule {}
