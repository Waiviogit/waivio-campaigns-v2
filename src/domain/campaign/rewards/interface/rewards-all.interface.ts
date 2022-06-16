import {
  GetRewardsByRequiredObjectType,
  GetRewardsMainType, RewardsAllType, RewardsByObjectType,
  RewardsByRequiredType,
  RewardsMainType,
} from '../types/rewards-all.types';

export interface RewardsAllInterface {
  getRewardsMain({
    skip,
    limit,
    host,
  }: GetRewardsMainType): Promise<RewardsAllType>;
  getRewardsByRequiredObject({
    requiredObject,
    skip,
    limit,
    host,
  }: GetRewardsByRequiredObjectType): Promise<RewardsByObjectType>;
}
