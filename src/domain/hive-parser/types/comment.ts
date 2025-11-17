export type MetadataType = {
  comment?: MetadataCommentType;
  waivioRewards?: MetadataWaivioRewardsType;
  wobj?: { wobjects: MetadataWobject[] };
  tags?: string[];
};

type MetadataWobject = {
  object_type: string;
  objectName: string;
  author_permlink: string;
  percent: number;
  tags?: string[];
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
  requiredObject?: string;
  reservationPermlink?: string;
  payoutTokenRateUSD?: number;
};
