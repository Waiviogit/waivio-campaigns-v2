import { Provider } from '@nestjs/common';

import { WOBJECT_SUBSCRIPTION_PROVIDE } from '../../common/constants';

import { GiveawayParticipantsRepository } from './giveaway-participants.repository';

export const WobjectSubscriptionsPersistenceProvider: Provider = {
  provide: WOBJECT_SUBSCRIPTION_PROVIDE.REPOSITORY,
  useClass: GiveawayParticipantsRepository,
};
