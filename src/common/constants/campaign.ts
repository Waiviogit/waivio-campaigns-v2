export const CAMPAIGN_STATUS = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  DELETED: 'deleted', // ?
  PAYED: 'payed', // ?
  REACHED_LIMIT: 'reachedLimit',
  ON_HOLD: 'onHold',
  SUSPENDED: 'suspended',
});

export const REWARDS_TAB = Object.freeze({
  ALL: 'all',
  ELIGIBLE: 'eligible',
  RESERVED: 'reserved',
});

export const CAMPAIGN_SORTS = Object.freeze({
  REWARD: 'reward',
  DATE: 'date',
  PROXIMITY: 'proximity',
  PAYOUT: 'payout',
  DEFAULT: 'default',
});

export const ACTIVE_CAMPAIGN_STATUSES = [
  CAMPAIGN_STATUS.ACTIVE,
  CAMPAIGN_STATUS.REACHED_LIMIT,
];

export const CAMPAIGN_STATUSES_FOR_ON_HOLD = [
  CAMPAIGN_STATUS.ACTIVE,
  CAMPAIGN_STATUS.ON_HOLD,
];

export const RESERVATION_STATUS = Object.freeze({
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  ACTIVE: 'active',
});

export const CAMPAIGN_TYPE = Object.freeze({
  REVIEWS: 'reviews',
});

export const SUPPORTED_CURRENCY = Object.freeze({
  USD: 'USD',
  CAD: 'CAD',
  EUR: 'EUR',
  AUD: 'AUD',
  MXN: 'MXN',
  GBP: 'GBP',
  JPY: 'JPY',
  CNY: 'CNY',
  RUB: 'RUB',
  UAH: 'UAH',
});

// export const PAYMENT_STATUS = Object.freeze({
//   ACTIVE: 'active',
//   REJECTED: 'rejected',
//   PAYED: 'payed',
// });

export const PAYOUT_TOKEN = Object.freeze({
  HIVE: 'HIVE',
  WAIV: 'WAIV',
});

export const PAYOUT_TOKEN_PRECISION = Object.freeze({
  HIVE: 3,
  WAIV: 8,
});

export const GUEST_BNF_ACC = 'waivio.hpower';

export const CAMPAIGN_PAYMENT = {
  REVIEW: 'review',
  TRANSFER: 'transfer',
  TRANSFER_TO_GUEST: 'transferToGuest',
  CAMPAIGNS_SERVER_FEE: 'campaignServerFee',
  REFERRAL_SERVER_FEE: 'referralServerFee',
  BENEFICIARY_FEE: 'beneficiaryFee',
  INDEX_FEE: 'indexFee',
  // DEMO_POST: 'demo_post',
  // DEMO_USER_TRANSFER: 'demo_user_transfer',
  //DEMO_DEBT: 'demo_debt',
  //USER_TO_GUEST_TRANSFER: 'user_to_guest_transfer',
  COMPENSATION_FEE: 'compensationFee',
  OVERPAYMENT_REFUND: 'overpaymentRefund', //?
};

export const CP_TRANSFER_TYPES = [
  CAMPAIGN_PAYMENT.TRANSFER,
  CAMPAIGN_PAYMENT.TRANSFER_TO_GUEST,
];

export const CP_REVIEW_TYPES = [
  CAMPAIGN_PAYMENT.REVIEW,
  CAMPAIGN_PAYMENT.CAMPAIGNS_SERVER_FEE,
  CAMPAIGN_PAYMENT.REFERRAL_SERVER_FEE,
  CAMPAIGN_PAYMENT.BENEFICIARY_FEE,
  CAMPAIGN_PAYMENT.INDEX_FEE,
  CAMPAIGN_PAYMENT.COMPENSATION_FEE,
  CAMPAIGN_PAYMENT.OVERPAYMENT_REFUND,
];

export const SECONDS_IN_DAY = 24 * 3600;
export const GPS_DIFF = 0.01;

export const CAMPAIGN_TRANSFER_ID = Object.freeze({
  CAMPAIGN_REWARD: 'campaignReward',
  GUEST_CAMPAIGN_REWARD: 'guestCampaignReward',
});

export const PAYABLE_DEADLINE = 30;
export const PAYABLE_WARNING = 21;

export const PAYABLE_DEBT_MAX_USD = 2;
