import { Provider } from '@nestjs/common';

import { BENEFICIARY_BOT_UPVOTE_PROVIDE } from '../../common/constants';
import { BeneficiaryBotUpvoteRepository } from './beneficiary-bot-upvote.repository';

export const BeneficiaryBotUpvotePersistenceProvider: Provider = {
  provide: BENEFICIARY_BOT_UPVOTE_PROVIDE.REPOSITORY,
  useClass: BeneficiaryBotUpvoteRepository,
};
