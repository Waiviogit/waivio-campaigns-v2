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
  campaignId?: string;
  reduceAmount?: number;
  riseAmount?: number;
  reservation_permlink?: string;
  activationPermlink?: string;
};
