import { RejectReservationType, validateAssignType } from '../types';

export interface RejectReservationInterface {
  rejectReservation({
    activationPermlink,
    reservationPermlink,
    rejectionPermlink,
    name,
  }: RejectReservationType): Promise<void>;
  validateRejectAssign({
    activationPermlink,
    reservationPermlink,
    rejectionPermlink,
    name,
  }: RejectReservationType): Promise<validateAssignType>;
}
