import { Provider } from '@nestjs/common';

import { Notifications } from './notifications';
import { NOTIFICATIONS_PROVIDE } from '../../common/constants';

export const NotificationsProvider: Provider = {
  provide: NOTIFICATIONS_PROVIDE.SERVICE,
  useClass: Notifications,
};
