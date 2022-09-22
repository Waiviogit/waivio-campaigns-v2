import {
  FilterUserHistoryType,
  RewardsByObjectType,
  UserAndObjectFollowing,
} from '../types';

export interface UserHistoryInterface {
  getHistory(params: GetHistoryInterface): Promise<RewardsByObjectType>;
  getFilters(
    params: GetUserHistoryFiltersInterface,
  ): Promise<FilterUserHistoryType>;
  checkUserFollowings(
    params: CheckUserFollowingsInterface,
  ): Promise<UserAndObjectFollowing>;
}

export interface GetHistoryInterface {
  userName: string;
  host: string;
  statuses?: string[];
  guideNames?: string[];
  sort?: string;
  skip?: number;
  limit?: number;
}

export interface GetUserHistoryFiltersInterface {
  userName: string;
}

export interface CheckUserFollowingsInterface {
  users: string[];
  objects: string[];
  user: string;
}

export interface CheckUsersFollowingInterface {
  users: string[];
  user: string;
}

export interface CheckObjectsFollowingInterface {
  objects: string[];
  user: string;
}
