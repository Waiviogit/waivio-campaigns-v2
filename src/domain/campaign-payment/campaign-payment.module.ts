import { Module } from '@nestjs/common';

import { GuidePaymentQProvider } from './campain-payment.provider';
import { PersistenceModule } from '../../persistance/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [GuidePaymentQProvider],
  exports: [GuidePaymentQProvider],
})
export class CampaignPaymentModule {}
