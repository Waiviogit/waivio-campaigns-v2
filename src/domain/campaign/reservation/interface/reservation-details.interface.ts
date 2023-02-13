import {
  GetReservationDetailsType,
  reservationCountType,
} from '../types/reservation-details.types';

export interface ReservationDetailsInterface {
  getDetails(
    params: GetReservationDetailsInterface,
  ): Promise<GetReservationDetailsType>;
  reservationCount({
    userName,
  }: reservationCountInterface): Promise<reservationCountType>;
}

export interface GetReservationDetailsInterface {
  campaignId: string;
  userName: string;
  host: string;
}

export interface reservationCountInterface {
  userName: string;
}
