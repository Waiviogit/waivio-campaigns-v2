export type UserMetadataSettingsType = {
  exitPageSetting: boolean;
  locale: string;
  postLocales: string[];
  nightmode: boolean;
  rewardSetting: string;
  rewriteLinks: boolean;
  showNSFWPosts: boolean;
  upvoteSetting: boolean;
  hiveBeneficiaryAccount: string;
  votePercent: number;
  votingPower: boolean;
};

export type UserDraftType = {
  title: string;
  draftId: string;
  author: string;
  beneficiary: boolean;
  upvote: boolean;
  isUpdating: boolean;
  body: string;
  originalBody: string;
  jsonMetadata: unknown;
  lastUpdated: number;
  parentAuthor: string;
  parentPermlink: string;
  permlink: string;
  reward: string;
};

export type AuthType = {
  id: string;
  provider: string;
};
