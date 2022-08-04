import { BoxType, RewardsAggregateMapType, RewardsMapType } from '../types';

export interface RewardsMapInterface {
  getMapAll(params: GetMapAllInterface): Promise<RewardsMapType>;
}

export interface GetFormattedMapInterface {
  rewards: RewardsAggregateMapType[];
  host: string;
}

export interface GetMapAllInterface {
  host: string;
  box: BoxType;
  skip?: number;
  limit?: number;
}
