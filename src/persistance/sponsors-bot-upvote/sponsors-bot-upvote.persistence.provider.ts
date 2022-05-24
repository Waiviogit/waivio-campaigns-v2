import { Provider } from '@nestjs/common';
import { SPONSORS_BOT_UPVOTE_PROVIDE } from '../../common/constants';

import { SponsorsBotUpvoteRepository } from './sponsors-bot-upvote.repository';

export const SponsorsBotUpvotePersistenceProvider: Provider = {
  provide: SPONSORS_BOT_UPVOTE_PROVIDE.REPOSITORY,
  useClass: SponsorsBotUpvoteRepository,
};
