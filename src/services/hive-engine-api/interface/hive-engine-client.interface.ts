import {
  EngineBalanceType,
  EngineBlockType,
  EngineRewardPoolType,
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
}
