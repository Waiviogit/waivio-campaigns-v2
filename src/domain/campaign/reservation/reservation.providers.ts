import { Provider } from '@nestjs/common';
import { RESERVATION_PROVIDE } from '../../../common/constants';

import { AssignReservation } from './assign-reservation';

export const AssignReservationProvider: Provider = {
  provide: RESERVATION_PROVIDE.ASSIGN,
  useClass: AssignReservation,
};
