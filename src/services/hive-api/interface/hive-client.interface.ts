import { HiveBlockType } from '../../../common/types';
import { HiveContentType, VoteOnPostType } from '../type';

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
}
