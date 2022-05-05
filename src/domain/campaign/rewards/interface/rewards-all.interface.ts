import {
  GetRewardsByRequiredObjectType,
  GetRewardsMainType,
  RewardsByRequiredType,
  RewardsMainType,
} from '../types/rewards-all.types';

export interface RewardsAllInterface {
  getRewardsMain({
    skip,
    limit,
    host,
  }: GetRewardsMainType): Promise<RewardsMainType[]>;
  getRewardsByRequiredObject({
    requiredObject,
    skip,
    limit,
    host,
  }: GetRewardsByRequiredObjectType): Promise<RewardsByRequiredType[]>;
}
