export type FormatVotesAndRewardsType = {
  votes: EngineVoteType[];
  rewards: EngineRewardType[];
};

export type EngineVoteType = {
  voter: string;
  author: string;
  permlink: string;
  weight: number;
  rshares: number;
  symbol: string;
};

export type EngineRewardType = {
  rewardPoolId: number;
  operation: string;
  authorperm: string;
  symbol: string;
  account: string;
  quantity: string;
};
