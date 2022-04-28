import { Provider } from '@nestjs/common';
import { RESERVATION_PROVIDE } from '../../../common/constants';

import { AssignReservation } from './assign-reservation';
import { RejectReservation } from './reject-reservation';
import { GuideRejectReservation } from './guide-reject-reservation';

export const AssignReservationProvider: Provider = {
  provide: RESERVATION_PROVIDE.ASSIGN,
  useClass: AssignReservation,
};

export const RejectReservationProvider: Provider = {
  provide: RESERVATION_PROVIDE.REJECT,
  useClass: RejectReservation,
};

export const GuideRejectReservationProvider: Provider = {
  provide: RESERVATION_PROVIDE.GUIDE_REJECT,
  useClass: GuideRejectReservation,
};
