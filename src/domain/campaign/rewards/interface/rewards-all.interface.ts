import {
  GetRewardsByRequiredObjectType,
  GetRewardsMainType,
  GetSponsorsType,
  RewardsAllType,
  RewardsByObjectType,
  RewardsByRequiredType,
  RewardsMainType,
} from '../types/rewards-all.types';

export interface RewardsAllInterface {
  getRewardsMain({
    skip,
    limit,
    host,
    sponsors,
    type,
    sort,
    area,
  }: GetRewardsMainType): Promise<RewardsAllType>;
  getRewardsByRequiredObject({
    requiredObject,
    skip,
    limit,
    host,
    sponsors,
    type,
    sort,
    area,
  }: GetRewardsByRequiredObjectType): Promise<RewardsByObjectType>;
  getSponsorsAll(requiredObject?: string): Promise<GetSponsorsType>;
}
