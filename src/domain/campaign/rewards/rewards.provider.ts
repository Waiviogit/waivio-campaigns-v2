import { Provider } from '@nestjs/common';

import { REWARDS_PROVIDE } from '../../../common/constants';
import { RewardsAll } from './rewards-all';
import { RewardsMap } from './rewards-map';

export const RewardsAllProvider: Provider = {
  provide: REWARDS_PROVIDE.ALL,
  useClass: RewardsAll,
};

export const RewardsMapProvider: Provider = {
  provide: REWARDS_PROVIDE.MAP,
  useClass: RewardsMap,
};
