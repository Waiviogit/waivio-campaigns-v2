export const CAMPAIGN_STATUS = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  DELETED: 'deleted',
  PAYED: 'payed',
  REACHED_LIMIT: 'reachedLimit',
  ON_HOLD: 'onHold',
  SUSPENDED: 'suspended',
});

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

export const PAYMENT_STATUS = Object.freeze({
  ACTIVE: 'active',
  REJECTED: 'rejected',
  PAYED: 'payed',
});

export const CAMPAIGN_PROVIDE = {
  REPOSITORY: 'CampaignRepository',
  CREATE_CAMPAIGN: 'CreateCampaign',
};