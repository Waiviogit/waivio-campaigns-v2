import { MarketPoolType } from '../types';

export interface HiveEngineClientInterface {
  getMarketPool(query: object): Promise<MarketPoolType>;
}
