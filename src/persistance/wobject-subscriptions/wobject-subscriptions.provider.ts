import { Provider } from '@nestjs/common';

import { WOBJECT_SUBSCRIPTION_PROVIDE } from '../../common/constants';

import { WobjectSubscriptions } from './wobject-subscriptions.schema';

export const WobjectSubscriptionsPersistenceProvider: Provider = {
  provide: WOBJECT_SUBSCRIPTION_PROVIDE.REPOSITORY,
  useClass: WobjectSubscriptions,
};
