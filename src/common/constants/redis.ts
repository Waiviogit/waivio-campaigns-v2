export const REDIS_KEY = Object.freeze({
  LAST_BLOCK_MAIN: 'campaign_v2_last_block',
  LAST_BLOCK_ENGINE: 'campaign_v2_engine_block',
  CAMPAIGN_EXPIRE: 'expire:campaign:',
  ASSIGN_EXPIRE: 'expire:assign:',
  CAMPAIGN_PAYMENT_EXPIRE: 'expire:campaignPayment:',
  CAMPAIGN_SUSPEND_WARNING: 'expire:suspendedWarning:',
  ASSIGN: 'assign:',
  REVIEW_DOWNVOTE: 'expire:reviewDownvote',
  SPONSOR_BOT_VOTE: 'expire:sponsorBotVote',
  REWARD_FUND: 'reward_fund',
  MEDIAN_HISTORY: 'current_median_history_price',
});

export const REDIS_EXPIRE = Object.freeze({
  CAMPAIGN_PAYMENT_EXPIRE: 2592000,
  CAMPAIGN_SUSPEND_WARNING_5: 2160000,
});

export const REDIS_DAYS_TO_SUSPEND = Object.freeze({
  FIVE: ':5',
});
