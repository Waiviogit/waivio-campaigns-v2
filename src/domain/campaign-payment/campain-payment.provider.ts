import { Provider } from '@nestjs/common';
import { CAMPAIGN_PAYMENT_PROVIDE } from '../../common/constants';
import { GuidePaymentsQuery } from './guide-payments.query';
import { UserPaymentsQuery } from './user-payments.query';

export const GuidePaymentQProvider: Provider = {
  provide: CAMPAIGN_PAYMENT_PROVIDE.GUIDE_PAYMENTS_Q,
  useClass: GuidePaymentsQuery,
};

export const UserPaymentQProvider: Provider = {
  provide: CAMPAIGN_PAYMENT_PROVIDE.USER_PAYMENTS_Q,
  useClass: UserPaymentsQuery,
};
