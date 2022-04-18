export const USER_SUBSCRIPTION_PROVIDE = Object.freeze({
  REPOSITORY: 'UserSubscriptionsRepository',
});

export const WOBJECT_SUBSCRIPTION_PROVIDE = Object.freeze({
  REPOSITORY: 'WobjectSubscriptionsRepository',
});

export const WOBJECT_PROVIDE = Object.freeze({
  REPOSITORY: 'WobjectRepository',
  HELPER: 'WobjectHelper',
});

export const USER_PROVIDE = Object.freeze({
  REPOSITORY: 'UserRepository',
});

export const APP_PROVIDE = Object.freeze({
  REPOSITORY: 'AppRepository',
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

export const HIVE_ENGINE_PROVIDE = Object.freeze({
  CLIENT: 'HiveEngineClient',
});

export const CAMPAIGN_PROVIDE = Object.freeze({
  REPOSITORY: 'CampaignRepository',
  CREATE_CAMPAIGN: 'CreateCampaign',
  UPDATE_CAMPAIGN: 'UpdateCampaign',
  DELETE_CAMPAIGN: 'DeleteCampaign',
  ACTIVATE_CAMPAIGN: 'ActivateCampaign',
  DEACTIVATE_CAMPAIGN: 'DeactivateCampaign',
  CAMPAIGN_HELPER: 'CampaignHelper',
});

export const RESERVATION_PROVIDE = Object.freeze({
  ASSIGN: 'AssignReservation',
});
