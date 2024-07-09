import { GuideRejectReservationType } from '../types';
import { RejectCustomType } from '../../../../common/types';

export interface GuideRejectReservationInterface {
  reject({
    reservationPermlink,
    guideName,
    rejectionPermlink,
  }: GuideRejectReservationType): Promise<void>;
  parseRejectFromCustomJson({
    id,
    parsedJson,
    required_auths,
    required_posting_auths,
    transaction_id,
  }: RejectCustomType): Promise<void>;
}
