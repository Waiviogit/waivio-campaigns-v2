export const REDIS_KEY = Object.freeze({
  LAST_BLOCK_MAIN: 'campaign_v2_last_block',
  CAMPAIGN_EXPIRE: 'expire:campaign:',
  ASSIGN_EXPIRE: 'expire:assign:',
  CAMPAIGN_PAYMENT_EXPIRE: 'expire:campaignPayment:',
  CAMPAIGN_SUSPEND_WARNING: 'expire:suspendedWarning:',
  ASSIGN: 'assign:',
});

export const REDIS_EXPIRE = Object.freeze({
  CAMPAIGN_PAYMENT_EXPIRE: 2592000,
  CAMPAIGN_SUSPEND_WARNING_5: 2160000,
});

export const REDIS_DAYS_TO_SUSPEND = Object.freeze({
  FIVE: ':5',
});
