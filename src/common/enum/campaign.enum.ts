export enum ReservationStatuses {
  ASSIGNED = 'assigned',
  UNASSIGNED = 'unassigned',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  ACTIVE = 'active',
}

export enum CampaignTypes {
  REVIEWS = 'reviews',
}

export enum CampaignStatuses {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  DELETED = 'deleted',
  PAYED = 'payed',
  REACHED_LIMIT = 'reachedLimit',
  ON_HOLD = 'onHold',
  SUSPENDED = 'suspended',
}

export enum SupportedCurrencies {
  USD = 'USD',
  CAD = 'CAD',
  EUR = 'EUR',
  AUD = 'AUD',
  MXN = 'MXN',
  GBP = 'GBP',
  JPY = 'JPY',
  CNY = 'CNY',
  RUB = 'RUB',
  UAH = 'UAH',
}

export enum PaymentStatuses {
  ACTIVE = 'active',
  REJECTED = 'rejected',
  PAYED = 'payed',
}
