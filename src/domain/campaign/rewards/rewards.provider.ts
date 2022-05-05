import { Provider } from '@nestjs/common';

import { REWARDS_PROVIDE } from '../../../common/constants';
import { RewardsAll } from './rewards-all';

export const RewardsAllProvider: Provider = {
  provide: REWARDS_PROVIDE.ALL,
  useClass: RewardsAll,
};
