import { Module } from '@nestjs/common';

import {
  GuidePaymentQProvider,
  UserPaymentQProvider,
} from './campain-payment.provider';
import { PersistenceModule } from '../../persistance/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [GuidePaymentQProvider, UserPaymentQProvider],
  exports: [GuidePaymentQProvider, UserPaymentQProvider],
})
export class CampaignPaymentModule {}
