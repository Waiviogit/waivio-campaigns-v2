import { Inject, Injectable } from '@nestjs/common';
import { REWARDS_PROVIDE } from '../../../common/constants';
import { RewardsAllInterface } from '../../../domain/campaign/rewards/interface/rewards-all.interface';
import {
  CanReserveParamType,
  CanReserveType,
  GetReservedType,
  GetRewardsByRequiredObjectType,
  GetRewardsEligibleType,
  GetRewardsMainType,
  GetSponsorsType,
  RewardsAllType,
  RewardsByObjectType,
  RewardsTabType,
} from '../../../domain/campaign/rewards/types/rewards-all.types';

@Injectable()
export class RewardsService {
  constructor(
    @Inject(REWARDS_PROVIDE.ALL)
    private readonly rewardsAll: RewardsAllInterface,
  ) {}

  async getAllRewards(params: GetRewardsMainType): Promise<RewardsAllType> {
    return this.rewardsAll.getRewardsMain(params);
  }

  async getAllEligible(
    params: GetRewardsEligibleType,
  ): Promise<RewardsAllType> {
    return this.rewardsAll.getRewardsEligibleMain(params);
  }

  async getAllRewardsByRequiredObject(
    params: GetRewardsByRequiredObjectType,
  ): Promise<RewardsByObjectType> {
    return this.rewardsAll.getRewardsByRequiredObject(params);
  }

  async getEligibleByObject(
    params: GetRewardsEligibleType,
  ): Promise<RewardsByObjectType> {
    return this.rewardsAll.getEligibleByObject(params);
  }

  async getSponsorsAll(requiredObject?: string): Promise<GetSponsorsType> {
    return this.rewardsAll.getSponsorsAll(requiredObject);
  }

  async getReserved(params: GetReservedType): Promise<RewardsByObjectType> {
    return this.rewardsAll.getReserved(params);
  }

  async getTabType(userName: string): Promise<RewardsTabType> {
    return this.rewardsAll.getRewardsTab(userName);
  }

  async canReserve(params: CanReserveParamType): Promise<CanReserveType> {
    return this.rewardsAll.canReserve(params);
  }
}
