import { CampaignPayment } from '../../../persistance/campaign-payment/campaign-payment.schema';

export type PayablesAllType = {
  userName: string;
  payable: string;
  alias: string;
  notPayedDate: string;
  notPayedPeriod?: number;
};

export type GetPayablesOutType = {
  histories: PayablesAllType[];
  totalPayable: number;
};

export type GetPayablesType = {
  guideName: string;
  payoutToken: string;
};

export type GetPayableType = {
  guideName: string;
  payoutToken: string;
  userName: string;
};

export type GetPayableAggregateType = {
  payable: number;
};

export type CampaignPaymentUserType = CampaignPayment & {
  balance: number;
};

export type getNotPayedDaysType = {
  totalPayable: number;
  histories: CampaignPaymentUserType[];
};

export type GetPayableOutType = {
  totalPayable: number;
  histories: CampaignPaymentUserType[];
  notPayedPeriod: number;
};
