import { Module } from '@nestjs/common';

import {
  GuidePaymentQProvider,
  PaymentReportProvider,
  UserPaymentQProvider,
} from './campain-payment.provider';
import { PersistenceModule } from '../../persistance/persistence.module';
import { WobjectModule } from '../wobject/wobject.module';
import { CurrencyRatesModule } from '../currency-rates/currency-rates.module';
import { CampaignProviderHelper } from '../campaign/campaign.provider';

@Module({
  imports: [PersistenceModule, WobjectModule, CurrencyRatesModule],
  providers: [
    GuidePaymentQProvider,
    UserPaymentQProvider,
    PaymentReportProvider,
    CampaignProviderHelper,
  ],
  exports: [GuidePaymentQProvider, UserPaymentQProvider, PaymentReportProvider],
})
export class CampaignPaymentModule {}
