import {
  GetReservedType,
  GetRewardsByRequiredObjectType,
  GetRewardsEligibleType,
  GetRewardsMainType,
  GetSponsorsType,
  RewardsAllType,
  RewardsByObjectType,
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
  getRewardsEligibleMain({
    skip,
    limit,
    host,
    sponsors,
    type,
    sort,
    area,
    userName,
  }: GetRewardsEligibleType): Promise<RewardsAllType>;
  getEligibleByObject({
    skip,
    limit,
    host,
    sponsors,
    type,
    userName,
  }: GetRewardsEligibleType): Promise<RewardsByObjectType>;
  getReserved({
    userName,
    skip,
    limit,
    host,
    sort,
    area,
    type,
    sponsors,
  }: GetReservedType): Promise<RewardsByObjectType>;
}
