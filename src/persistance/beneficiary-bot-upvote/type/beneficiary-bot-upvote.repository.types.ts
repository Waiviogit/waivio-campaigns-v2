import { BeneficiaryBotUpvote } from '../beneficiary-bot-upvote.schema';
import { ObjectId } from 'mongoose';

export type CreateBeneficiaryUpvoteType = Omit<
  BeneficiaryBotUpvote,
  'startedAt' | 'expiredAt'
>;

export type GetBeneficiaryUpvoteType = {
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
  activationPermlink: string;
  amountToVote: number;
};

export type UpdateBeneficiaryStatusType = {
  _id: ObjectId;
  status: string;
  currentVote?: number;
  voteWeight?: number;
};

export type UpdateBeneficiaryStatusDataType = {
  $set: Omit<UpdateBeneficiaryStatusType, '_id'>;
};
