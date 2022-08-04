import { ProcessedWobjectType } from '../../../wobject/types';

export type RewardsAggregateMapType = {
  _id: string;
  maxReward: number;
  object: ProcessedWobjectType;
};

export type FormattedMapType = {
  maxReward: number;
  author_permlink: string;
  avatar: string;
  name: string;
  map: MapType;
};

export type RewardsMapType = {
  rewards: FormattedMapType[];
  hasMore: boolean;
};

export type MapType = {
  latitude: number;
  longitude: number;
};

export type BoxType = {
  bottomPoint: [number, number];
  topPoint: [number, number];
};
