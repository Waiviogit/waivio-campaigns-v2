import { ObjectRewardsType } from '../types/object-rewards.types';

export interface ObjectRewardsInterface {
  getObjectRewards(
    params: GetObjectRewardsInterface,
  ): Promise<ObjectRewardsType>;
}

export interface GetObjectRewardsInterface {
  userName?: string;
  authorPermlink: string;
  host: string;
}

export interface GetSecondaryObjectsRewards {
  userName?: string;
  objectLinks: string[];
  host: string;
}
