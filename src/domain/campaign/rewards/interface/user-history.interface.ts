import { FilterUserHistoryType, RewardsByObjectType } from '../types';

export interface UserHistoryInterface {
  getHistory(params: GetHistoryInterface): Promise<RewardsByObjectType>;
  getFilters(
    params: GetUserHistoryFiltersInterface,
  ): Promise<FilterUserHistoryType>;
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
