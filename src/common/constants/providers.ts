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
export const SPONSORS_BOT_PROVIDE = Object.freeze({
  REPOSITORY: 'SponsorsBotRepository',
  BOT: 'SponsorsBot',
});

export const CURRENCY_RATES_PROVIDE = Object.freeze({
  REPOSITORY: 'CurrencyRatesRepository',
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
  TRANSFER: 'HiveTransferParser',
  JSON: 'HiveJsonParser',
  ACCOUNT_UPDATE: 'HiveAccountUpdateParser',
});

export const ENGINE_PARSER_PROVIDE = Object.freeze({
  MAIN: 'EngineMainParser',
  TRANSFER: 'EngineTransferParser',
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
  GUIDE_CAMPAIGNS: 'GuideCampaigns',
  DEBT_OBLIGATIONS: 'DebtObligations',
  SUSPEND: 'CampaignSuspend',
});

export const CAMPAIGN_PAYMENT_PROVIDE = Object.freeze({
  REPOSITORY: 'CampaignPaymentRepository',
  GUIDE_PAYMENTS_Q: 'GuidePaymentsQuery',
});

export const RESERVATION_PROVIDE = Object.freeze({
  ASSIGN: 'AssignReservation',
  REJECT: 'RejectReservation',
  GUIDE_REJECT: 'GuideRejectReservation',
});

export const REVIEW_PROVIDE = Object.freeze({
  CREATE: 'CreateReview',
  FRAUD: 'FraudDetection',
});

export const REWARDS_PROVIDE = Object.freeze({
  ALL: 'RewardsAll',
});
