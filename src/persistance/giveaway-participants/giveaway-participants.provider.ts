import { Provider } from '@nestjs/common';

import { GIVEAWAY_PARTICIPANTS_PROVIDE } from '../../common/constants';

import { GiveawayParticipantsRepository } from './giveaway-participants.repository';

export const GiveawayParticipantsPersistenceProvider: Provider = {
  provide: GIVEAWAY_PARTICIPANTS_PROVIDE.REPOSITORY,
  useClass: GiveawayParticipantsRepository,
};
