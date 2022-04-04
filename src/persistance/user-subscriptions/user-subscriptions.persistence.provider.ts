import { Provider } from '@nestjs/common';

import { USER_SUBSCRIPTION_PROVIDE } from '../../common/constants';
import { UserSubscriptions } from './user-subscriptions.schema';

export const UserSubscriptionsPersistenceProvider: Provider = {
  provide: USER_SUBSCRIPTION_PROVIDE.REPOSITORY,
  useClass: UserSubscriptions,
};
