import { GuideRejectReservationType } from '../types';

export interface GuideRejectReservationInterface {
  reject({
    reservationPermlink,
    guideName,
    rejectionPermlink,
  }: GuideRejectReservationType): Promise<void>;
}
