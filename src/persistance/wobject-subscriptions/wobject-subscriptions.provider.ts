import { Provider } from '@nestjs/common';

import { WOBJECT_SUBSCRIPTION_PROVIDE } from '../../common/constants';

import { WobjectSubscriptionsRepository } from './wobject-subscriptions.repository';

export const WobjectSubscriptionsPersistenceProvider: Provider = {
  provide: WOBJECT_SUBSCRIPTION_PROVIDE.REPOSITORY,
  useClass: WobjectSubscriptionsRepository,
};
