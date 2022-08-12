import { GetReservationDetailsType } from '../types/reservation-details.types';

export interface ReservationDetailsInterface {
  getDetails(
    params: GetReservationDetailsInterface,
  ): Promise<GetReservationDetailsType>;
}

export interface GetReservationDetailsInterface {
  campaignId: string;
  userName: string;
  host: string;
}
