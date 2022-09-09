import { CampaignPayment } from '../../../persistance/campaign-payment/campaign-payment.schema';
import { RewardsByRequiredType } from '../../campaign/rewards/types';

export type PayablesAllType = {
  userName: string;
  payable: number;
  alias: string;
  notPayedDate: string;
  notPayedPeriod?: number;
};

export type GetPayablesOutType = {
  histories: PayablesAllType[];
  totalPayable: number;
  hasMore: boolean;
};

export type GetPayablesType = {
  guideName: string;
  payoutToken: string;
  days?: number;
  payable?: number;
  skip?: number;
  limit?: number;
};

export type GetPayableType = {
  guideName: string;
  payoutToken: string;
  userName: string;
  host?: string;
};

export type GetPayableAggregateType = {
  payable: number;
  notPayedPeriod: number;
};

export type CampaignPaymentUserType = CampaignPayment & {
  balance: number;
  currentUser?: string;
  payableInDollars?: number;
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

export type GetGuidesTotalPayedType = {
  guideNames: string[];
  payoutToken: string;
};
export type GuidesTotalPayedType = {
  payed: number;
  guideName: string;
};

export type AddDataOnRewardsByObjectType = {
  host: string;
  rewards: RewardsByRequiredType[];
};
