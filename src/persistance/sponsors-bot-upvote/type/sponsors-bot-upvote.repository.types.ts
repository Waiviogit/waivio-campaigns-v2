import { SponsorsBotUpvote } from '../sponsors-bot-upvote.schema';
import {
  FilterQuery,
  ObjectId,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { SponsorsBotUpvoteDocumentType } from './sponsors-bot-upvote.types';

export type CreateUpvoteType = Omit<
  SponsorsBotUpvote,
  'startedAt' | 'expiredAt'
>;

export type GetUpvoteType = {
  _id: ObjectId;
  botName: string;
  sponsor: string;
  symbol: string;
  votingPercent: number;
  minVotingPower: number;
  author: string;
  userName: string;
  permlink: string;
  reward: number;
  totalVotesWeight: number;
  requiredObject: string;
  amountToVote: number;
  reservationPermlink?: string;
};

export type UpdateStatusType = {
  _id: ObjectId;
  status: string;
  currentVote?: number;
  voteWeight?: number;
};

export type UpdateStatusDataType = {
  $set: Omit<UpdateStatusType, '_id'>;
};

export type UpdateUpvotesType = {
  filter: FilterQuery<SponsorsBotUpvoteDocumentType>;
  update:
    | UpdateWithAggregationPipeline
    | UpdateQuery<SponsorsBotUpvoteDocumentType>;
  options?: QueryOptions;
};

export type UpvotesFindType = {
  filter: FilterQuery<SponsorsBotUpvoteDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
