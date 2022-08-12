import { RewardsByRequiredType, RewardsMainType } from './rewards-all.types';

export type ObjectRewardsType = {
  authorPermlink: string;
  main: RewardsMainType | null;
  secondary: RewardsByRequiredType[];
};
