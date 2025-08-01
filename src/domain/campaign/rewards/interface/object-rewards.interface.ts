import { ObjectRewardsType } from '../types/object-rewards.types';
import { UserRewardsType } from '../types/user-rewards.types';

export interface ObjectRewardsInterface {
  getObjectRewards(
    params: GetObjectRewardsInterface,
  ): Promise<ObjectRewardsType>;
}

export interface UserRewardsInterface {
  getUserRewards(params: GetUserRewardsInterface): Promise<UserRewardsType>;
}

export interface GetObjectRewardsInterface {
  userName?: string;
  authorPermlink: string;
  host: string;
}

export interface GetUserRewardsInterface {
  userName?: string;
  user: string;
  host: string;
}

export interface GetSecondaryObjectsRewards {
  userName?: string;
  objectLinks: string[];
  host: string;
}
