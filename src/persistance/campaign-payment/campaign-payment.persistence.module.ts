import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';
import {
  CampaignPayment,
  CampaignPaymentSchema,
} from './campaign-payment.schema';
import { CampaignPaymentPersistenceProvider } from './campaign-payment.persistence.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: CampaignPayment.name,
          schema: CampaignPaymentSchema,
          collection: COLLECTION.CAMPAIGN_PAYMENT,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [CampaignPaymentPersistenceProvider],
  exports: [CampaignPaymentPersistenceProvider],
})
export class CampaignPaymentPersistenceModule {}
