import { Provider } from '@nestjs/common';

import { REWARDS_PROVIDE } from '../../../common/constants';
import { RewardsAll } from './rewards-all';
import { RewardsMap } from './rewards-map';
import { ObjectRewards } from './object-rewards';
import {RewardsHelper} from "./rewards-helper";

export const RewardsAllProvider: Provider = {
  provide: REWARDS_PROVIDE.ALL,
  useClass: RewardsAll,
};

export const RewardsMapProvider: Provider = {
  provide: REWARDS_PROVIDE.MAP,
  useClass: RewardsMap,
};

export const ObjectRewardsProvider: Provider = {
  provide: REWARDS_PROVIDE.OBJECT,
  useClass: ObjectRewards,
};

export const RewardsHelperProvider: Provider = {
  provide: REWARDS_PROVIDE.HELPER,
  useClass: RewardsHelper,
};
