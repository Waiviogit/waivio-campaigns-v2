import { Provider } from '@nestjs/common';

import { REWARDS_PROVIDE } from '../../../common/constants';
import { RewardsAll } from './rewards-all';
import { RewardsMap } from './rewards-map';
import { ObjectRewards } from './object-rewards';
import { RewardsHelper } from './rewards-helper';
import { GuideReservations } from './guide-reservations';
import { UserHistory } from './user-history';
import { UserRewards } from './user-rewards';
import { Giveaway } from './giveaway';
import { GiveawayObject } from './giveaway-object';
import { ContestObject } from './contest-object';
import { AuthoritiesCampaign } from './authorities-campaign';

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

export const GiveawayProvider: Provider = {
  provide: REWARDS_PROVIDE.GIVEAWAY,
  useClass: Giveaway,
};

export const GiveawayObjectProvider: Provider = {
  provide: REWARDS_PROVIDE.GIVEAWAY_OBJECT,
  useClass: GiveawayObject,
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

export const ContestProvider: Provider = {
  provide: REWARDS_PROVIDE.CONTEST_OBJECT,
  useClass: ContestObject,
};

export const AuthoritiesCampaignProvider: Provider = {
  provide: REWARDS_PROVIDE.AUTHORITIES_CAMPAIGN,
  useClass: AuthoritiesCampaign,
};
