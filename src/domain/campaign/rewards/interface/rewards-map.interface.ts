import { BoxType, RewardsAggregateMapType, RewardsMapType } from '../types';

export interface RewardsMapInterface {
  getMapAll(params: GetMapAllInterface): Promise<RewardsMapType>;
  getMapEligible(params: GetMapEligibleInterface): Promise<RewardsMapType>;
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

export interface GetMapEligibleInterface extends GetMapAllInterface {
  userName: string;
}

export interface GetMapPipeInterface {
  box: BoxType;
  skip: number;
  limit: number;
}
