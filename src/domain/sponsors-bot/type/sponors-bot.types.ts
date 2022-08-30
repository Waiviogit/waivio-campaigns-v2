import { ReviewCampaignType } from '../../campaign/review/types';
import { GetUpvoteType } from '../../../persistance/sponsors-bot-upvote/type';
import BigNumber from 'bignumber.js';

export type ParseHiveCustomJsonType = {
  id: string;
  authorizedUser: string;
  json: SponsorsBotJsonType;
};

export type SponsorsBotJsonType = {
  sponsor: string;
  votingPercent?: number;
  note?: string;
  enabled?: boolean;
  expiredAt?: string;
  votingPower?: number;
};

export type CheckDisableType = {
  botName: string;
  accountAuths: [string, number][];
};

export type CreateUpvoteRecordsType = {
  campaign: ReviewCampaignType;
  permlink: string;
  botName?: string;
};

export type GetWeightToVoteType = {
  amount: number;
  symbol: string;
  votingPower: number;
  account: string;
  maxVoteWeight: number;
};

export type UpdateDataAfterVoteType = {
  upvote: GetUpvoteType;
  weight: number;
  authorReward: BigNumber;
  curationReward: BigNumber;
};

export type ProcessSponsorsBotVoteType = {
  author: string;
  permlink: string;
  voter: string;
};

export type RewardAmountType = {
  curationReward: BigNumber;
  authorReward: BigNumber;
};

export type mappedSponsorType = {
  botName: string;
  minVotingPower: number;
  sponsor: string;
  note: string;
  enabled: boolean;
  votingPercent: number;
  expiredAt: Date;
};

export type SponsorsBotApiType = {
  results: mappedSponsorType[];
  minVotingPower: number;
};
