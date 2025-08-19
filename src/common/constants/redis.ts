export const REDIS_KEY = Object.freeze({
  LAST_BLOCK_MAIN: 'campaign_v2_last_block',
  LAST_BLOCK_ENGINE: 'campaign_v2_engine_block',
  CAMPAIGN_EXPIRE: 'expire:campaign:',
  GIVEAWAY_MESSAGE_EXPIRE: 'expire:giveaway_message:',
  GIVEAWAY_OBJECT_RECURRENT: 'expire:giveaway_object_recurrent:',
  CONTEST_OBJECT_RECURRENT: 'expire:contest_object_recurrent:',
  ASSIGN_EXPIRE: 'expire:assign:',
  CAMPAIGN_PAYMENT_EXPIRE: 'expire:campaignPayment:',
  CAMPAIGN_SUSPEND_WARNING: 'expire:suspendedWarning:',
  ASSIGN: 'assign:',
  REVIEW_DOWNVOTE: 'expire:reviewDownvote',
  SPONSOR_BOT_VOTE: 'expire:sponsorBotVote',
  SPONSOR_BOT_POST: 'expire:sponsorBotPost',
  SPONSOR_BOT_CURRENT_VOTE: 'expire:sponsorBotCurrentVote',
  REWARD_FUND: 'reward_fund',
  MEDIAN_HISTORY: 'current_median_history_price',
  PUBLISH_EXPIRE_ASSIGN: 'expire:assign',
  PUBLISH_EXPIRE_ASSIGN_FALSE: 'expire:assign:false',
  PUBLISH_EXPIRE_RELEASE: 'expire:release',
  PUBLISH_EXPIRE_RELEASE_FALSE: 'expire:release:false',
  PUBLISH_EXPIRE_DEACTIVATION: 'expire:deactivation',
  PUBLISH_EXPIRE_DEACTIVATION_FALSE: 'expire:deactivation:false',
  PUBLISH_EXPIRE_TRX_ID: 'expire:transactionId',
  HOSTS_TO_PARSE_OBJECTS: 'hosts_to_parse_objects',
  // Comment queue keys
  COMMENT_QUEUE: 'comment_queue',
  COMMENT_PROCESSING: 'comment_processing',
  COMMENT_FAILED: 'comment_failed',
});

export const REDIS_EXPIRE = Object.freeze({
  CAMPAIGN_PAYMENT_EXPIRE: 2592000,
  CAMPAIGN_SUSPEND_WARNING_5: 2160000,
});

export const REDIS_DAYS_TO_SUSPEND = Object.freeze({
  FIVE: ':5',
});
