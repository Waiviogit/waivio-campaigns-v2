import { Inject, Injectable } from '@nestjs/common';
import { REWARDS_PROVIDE } from '../../common/constants';
import { RewardsAllInterface } from '../../domain/campaign/rewards/interface/rewards-all.interface';
import {
  GetRewardsByRequiredObjectType,
  GetRewardsMainType,
  RewardsByRequiredType,
  RewardsMainType,
} from '../../domain/campaign/rewards/types/rewards-all.types';

@Injectable()
export class RewardsService {
  constructor(
    @Inject(REWARDS_PROVIDE.ALL)
    private readonly rewardsAll: RewardsAllInterface,
  ) {}

  async getAllRewards(params: GetRewardsMainType): Promise<RewardsMainType[]> {
    return this.rewardsAll.getRewardsMain(params);
  }

  async getAllRewardsByRequiredObject(
    params: GetRewardsByRequiredObjectType,
  ): Promise<RewardsByRequiredType[]> {
    return this.rewardsAll.getRewardsByRequiredObject(params);
  }
}
