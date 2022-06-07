import { Provider } from '@nestjs/common';

import { CAMPAIGN_PAYMENT_PROVIDE } from '../../common/constants';

import { CampaignPaymentRepository } from './campaign-payment.repository';

export const CampaignPaymentPersistenceProvider: Provider = {
  provide: CAMPAIGN_PAYMENT_PROVIDE.REPOSITORY,
  useClass: CampaignPaymentRepository,
};
