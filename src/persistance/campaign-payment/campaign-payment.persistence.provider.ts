import { Provider } from '@nestjs/common';

import { CAMPAIGN_PAYMENT_PROVIDE } from '../../common/constants';
import { CampaignPayment } from './campaign-payment.schema';

export const CampaignPaymentPersistenceProvider: Provider = {
  provide: CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY,
  useClass: CampaignPayment,
};
