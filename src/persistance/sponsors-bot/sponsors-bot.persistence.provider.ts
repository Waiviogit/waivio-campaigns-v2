import { Provider } from '@nestjs/common';
import { SPONSORS_BOT_PROVIDE } from '../../common/constants';
import { SponsorsBotRepository } from './sponsors-bot.repository';

export const SponsorsBotPersistenceProvider: Provider = {
  provide: SPONSORS_BOT_PROVIDE.REPOSITORY,
  useClass: SponsorsBotRepository,
};
