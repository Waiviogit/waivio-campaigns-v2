import { FilterReservationsType, RewardsByObjectType } from '../types';

export interface GuideReservationsInterface {
  getReservations(
    params: GetReservationsInterface,
  ): Promise<RewardsByObjectType>;

  getFilters(
    params: GetGuideReservationFiltersInterface,
  ): Promise<FilterReservationsType>;
}

export interface GetReservationsInterface {
  guideName: string;
  host: string;
  statuses?: string[];
  sort?: string;
  campaignNames?: string[];
  skip?: number;
  limit?: number;
}

export interface GetGuideReservationFiltersInterface {
  guideName: string;
}
