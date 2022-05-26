import { ReviewCampaignType } from '../../campaign/review/types';
import {GetUpvoteType} from "../../../persistance/sponsors-bot-upvote/type";

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
};

export type UpdateDataAfterVoteType = {
  upvote: GetUpvoteType;
  weight: number;
};
