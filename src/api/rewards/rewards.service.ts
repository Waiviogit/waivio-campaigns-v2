import { Inject, Injectable } from '@nestjs/common';
import { REWARDS_PROVIDE } from '../../common/constants';
import { RewardsAllInterface } from '../../domain/campaign/rewards/interface/rewards-all.interface';
import {
  GetRewardsByRequiredObjectType,
  GetRewardsEligibleType,
  GetRewardsMainType,
  GetSponsorsType,
  RewardsAllType,
  RewardsByObjectType,
} from '../../domain/campaign/rewards/types/rewards-all.types';

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

  async getSponsorsAll(requiredObject?: string): Promise<GetSponsorsType> {
    return this.rewardsAll.getSponsorsAll(requiredObject);
  }
}
