import { Provider } from '@nestjs/common';

import { USER_SUBSCRIPTION_PROVIDE } from '../../common/constants';
import { UserSubscriptionsRepository } from './user-subscriptions.repository';

export const UserSubscriptionsPersistenceProvider: Provider = {
  provide: USER_SUBSCRIPTION_PROVIDE.REPOSITORY,
  useClass: UserSubscriptionsRepository,
};
