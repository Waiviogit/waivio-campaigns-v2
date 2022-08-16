import { Provider } from '@nestjs/common';
import { CAMPAIGN_PAYMENT_PROVIDE } from '../../common/constants';
import { GuidePaymentsQuery } from './guide-payments.query';
import { UserPaymentsQuery } from './user-payments.query';
import { PaymentReport } from './payment-report';

export const GuidePaymentQProvider: Provider = {
  provide: CAMPAIGN_PAYMENT_PROVIDE.GUIDE_PAYMENTS_Q,
  useClass: GuidePaymentsQuery,
};

export const UserPaymentQProvider: Provider = {
  provide: CAMPAIGN_PAYMENT_PROVIDE.USER_PAYMENTS_Q,
  useClass: UserPaymentsQuery,
};

export const PaymentReportProvider: Provider = {
  provide: CAMPAIGN_PAYMENT_PROVIDE.PAYMENT_REPORT,
  useClass: PaymentReport,
};
