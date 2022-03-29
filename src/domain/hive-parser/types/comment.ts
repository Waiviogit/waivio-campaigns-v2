export type MetadataType = {
  comment?: MetadataCommentType;
  waivioRewards?: MetadataWaivioRewardsType;
};

type MetadataCommentType = {
  userId: string;
  social: string;
};

type MetadataWaivioRewardsType = {
  type: string;
  approved_object?: string;
  currencyId?: string;
  campaign_id?: string;
  reduceAmount?: number;
  riseAmount?: number;
  reservation_permlink?: string;
  activationPermlink?: string;
};
