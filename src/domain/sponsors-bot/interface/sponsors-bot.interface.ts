import {
  CheckDisableType,
  CreateUpvoteRecordsType,
  ParseHiveCustomJsonType,
  SponsorsBotApiType,
} from '../type';
import { EngineVoteType } from '../../engine-parser/types';

export interface SponsorsBotInterface {
  parseHiveCustomJson({
    id,
    authorizedUser,
    json,
  }: ParseHiveCustomJsonType): Promise<void>;
  checkDisable({ botName, accountAuths }: CheckDisableType): Promise<void>;
  createUpvoteRecords({
    campaign,
    botName,
    permlink,
  }: CreateUpvoteRecordsType): Promise<void>;
  executeUpvotes(): Promise<void>;
  parseVotes(votes: EngineVoteType[]): Promise<void>;
  expireListener(key: string): Promise<void>;

  getSponsorsBot(params: GetSponsorsBotInterface): Promise<SponsorsBotApiType>;
  removeVotesOnReview({
    reservationPermlink,
  }: RemoveVotesOnReviewInterface): Promise<void>;
}

export interface GetSponsorsBotInterface {
  botName: string;
  symbol: string;
  skip?: number;
  limit?: number;
}

export interface GetVoteAmountInterface {
  votingPower: number;
  weight: number;
  account: string;
  symbol: string;
}

export interface RemoveVotesOnReviewInterface {
  reservationPermlink: string;
}
