export const USER_SUBSCRIPTION_PROVIDE = Object.freeze({
  REPOSITORY: 'UserSubscriptionsRepository',
});

export const WOBJECT_SUBSCRIPTION_PROVIDE = Object.freeze({
  REPOSITORY: 'WobjectSubscriptionsRepository',
});

export const WOBJECT_PROVIDE = Object.freeze({
  REPOSITORY: 'WobjectRepository',
});

export const USER_PROVIDE = Object.freeze({
  REPOSITORY: 'UserRepository',
});

export const POST_PROVIDE = Object.freeze({
  REPOSITORY: 'PostRepository',
});

export const REDIS_PROVIDE = Object.freeze({
  BLOCK_CLIENT: 'RedisBlockClient',
  CAMPAIGN_CLIENT: 'RedisCampaignClient',
});

export const NOTIFICATIONS_PROVIDE = Object.freeze({
  SERVICE: 'NotificationsService',
});

export const HIVE_PARSER_PROVIDE = Object.freeze({
  MAIN: 'HiveMainParser',
  COMMENT: 'HiveCommentParser',
});

export const HIVE_PROVIDE = Object.freeze({
  CLIENT: 'HiveClient',
});

export const CAMPAIGN_PROVIDE = Object.freeze({
  REPOSITORY: 'CampaignRepository',
  CREATE_CAMPAIGN: 'CreateCampaign',
  UPDATE_CAMPAIGN: 'UpdateCampaign',
  DELETE_CAMPAIGN: 'DeleteCampaign',
  ACTIVATE_CAMPAIGN: 'ActivateCampaign',
  CAMPAIGN_HELPER: 'CampaignHelper',
});
