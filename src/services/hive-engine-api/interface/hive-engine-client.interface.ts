import {
  EngineBalanceType,
  EngineBlockType,
  EngineRewardPoolType,
  EngineVoteType,
  EngineVotingPowerType,
  MarketPoolType,
} from '../types';

export interface HiveEngineClientInterface {
  getMarketPool(query: object): Promise<MarketPoolType>;
  getBlock(blockNumber: number): Promise<EngineBlockType>;
  getVotingPower(
    account: string,
    symbol: string,
  ): Promise<EngineVotingPowerType>;
  getRewardPool(symbol: string): Promise<EngineRewardPoolType>;
  getTokenBalance(account: string, symbol: string): Promise<EngineBalanceType>;
  getActiveVotes({
    author,
    permlink,
    symbol,
  }: GetActiveVotesInterface): Promise<EngineVoteType[]>;
  getVote({
    author,
    permlink,
    symbol,
    voter,
  }: GetVoteInterface): Promise<EngineVoteType>;
}

export interface GetActiveVotesInterface {
  author: string;
  permlink: string;
  symbol: string;
}

export interface GetVoteInterface extends GetActiveVotesInterface {
  voter: string;
}
