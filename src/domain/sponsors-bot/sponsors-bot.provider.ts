import { Provider } from '@nestjs/common';
import { SPONSORS_BOT_PROVIDE } from '../../common/constants';
import { SponsorsBot } from './sponsors-bot';

export const SponsorsBotProvider: Provider = {
  provide: SPONSORS_BOT_PROVIDE.BOT,
  useClass: SponsorsBot,
};
