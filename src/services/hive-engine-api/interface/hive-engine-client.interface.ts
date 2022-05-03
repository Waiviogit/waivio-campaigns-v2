import { EngineBlockType, MarketPoolType } from '../types';

export interface HiveEngineClientInterface {
  getMarketPool(query: object): Promise<MarketPoolType>;
  getBlock(blockNumber: number): Promise<EngineBlockType>;
}
