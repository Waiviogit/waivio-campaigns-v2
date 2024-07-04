import { RewardsByRequiredType, RewardsMainType } from './rewards-all.types';

export type UserRewardsType = {
  user: string;
  main: RewardsMainType | null;
  secondary: RewardsByRequiredType[];
};
