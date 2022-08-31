import { Provider } from '@nestjs/common';
import { RESERVATION_PROVIDE } from '../../../common/constants';

import { AssignReservation } from './assign-reservation';
import { RejectReservation } from './reject-reservation';
import { GuideRejectReservation } from './guide-reject-reservation';
import { ReservationDetails } from './reservation-details';
import { ReservationHelper } from './reservation-helper';

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

export const ReservationDetailsProvider: Provider = {
  provide: RESERVATION_PROVIDE.DETAILS,
  useClass: ReservationDetails,
};

export const ReservationHelperProvider: Provider = {
  provide: RESERVATION_PROVIDE.HELPER,
  useClass: ReservationHelper,
};
