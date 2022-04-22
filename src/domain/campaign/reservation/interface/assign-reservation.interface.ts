import {
  AssignReservationType,
  validateAssignType,
  ValidateAssignType,
} from '../types';

export interface AssignReservationInterface {
  assign({
    activationPermlink,
    reservationPermlink,
    name,
    requiredObject,
    rootName,
    referralServer,
  }: AssignReservationType): Promise<void>;
  validateAssign({
    activationPermlink,
    reservationPermlink,
    name,
    requiredObject,
  }: ValidateAssignType): Promise<validateAssignType>;
}
