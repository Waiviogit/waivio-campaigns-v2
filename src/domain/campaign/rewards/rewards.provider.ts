import { Provider } from '@nestjs/common';

import { REWARDS_PROVIDE } from '../../../common/constants';
import { RewardsAll } from './rewards-all';
import { RewardsMap } from './rewards-map';
import { ObjectRewards } from './object-rewards';
import { RewardsHelper } from './rewards-helper';
import { GuideReservations } from './guide-reservations';
import { UserHistory } from './user-history';
import {UserRewards} from "./user-rewards";

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

export const UserRewardsProvider: Provider = {
  provide: REWARDS_PROVIDE.USER,
  useClass: UserRewards,
};

export const RewardsHelperProvider: Provider = {
  provide: REWARDS_PROVIDE.HELPER,
  useClass: RewardsHelper,
};

export const GuideReservationsProvider: Provider = {
  provide: REWARDS_PROVIDE.GUIDE_RESERVATIONS,
  useClass: GuideReservations,
};

export const UserHistoryProvider: Provider = {
  provide: REWARDS_PROVIDE.USER_HISTORY,
  useClass: UserHistory,
};
