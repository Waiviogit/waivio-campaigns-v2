import { HiveBlockType } from '../../../common/types';
import {
  ActiveVotesType,
  BroadcastCommentType,
  CommentStateType,
  HiveContentType,
  VoteOnPostType,
} from '../type';

export interface HiveClientInterface {
  getBlock(blockNumber: number): Promise<HiveBlockType | undefined>;
  voteOnPost({
    key,
    voter,
    author,
    permlink,
    weight,
  }: VoteOnPostType): Promise<boolean>;
  getContent(author: string, permlink: string): Promise<HiveContentType>;
  getActiveVotes(author: string, permlink: string): Promise<ActiveVotesType[]>;
  getVote({
    author,
    voter,
    permlink,
  }: GetVoteInterface): Promise<ActiveVotesType>;
  getState(author: string, permlink: string): Promise<CommentStateType>;
  createComment(params: BroadcastCommentType): Promise<boolean>;
}

export interface GetVoteInterface {
  voter: string;
  author: string;
  permlink: string;
}
