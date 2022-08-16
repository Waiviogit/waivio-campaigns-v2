import { Module } from '@nestjs/common';

import {
  GuidePaymentQProvider,
  PaymentReportProvider,
  UserPaymentQProvider,
} from './campain-payment.provider';
import { PersistenceModule } from '../../persistance/persistence.module';
import { WobjectModule } from '../wobject/wobject.module';

@Module({
  imports: [PersistenceModule, WobjectModule],
  providers: [
    GuidePaymentQProvider,
    UserPaymentQProvider,
    PaymentReportProvider,
  ],
  exports: [GuidePaymentQProvider, UserPaymentQProvider, PaymentReportProvider],
})
export class CampaignPaymentModule {}
