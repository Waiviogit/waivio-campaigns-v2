export const REDIS_KEY = Object.freeze({
  LAST_BLOCK_MAIN: 'campaign_v2_last_block',
  CAMPAIGN_EXPIRE: 'expire:campaign:',
});

export const REDIS_PROVIDE = Object.freeze({
  BLOCK_CLIENT: 'RedisBlockClient',
  CAMPAIGN_CLIENT: 'RedisCampaignClient',
});
