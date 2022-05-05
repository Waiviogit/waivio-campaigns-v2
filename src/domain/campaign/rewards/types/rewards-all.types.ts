import { ProcessedWobjectType } from '../../../wobject/types';
import {
  ReviewRequirementsType,
  UserRequirementsType,
} from '../../../../persistance/campaign/types';

export type RewardsMainType = {
  object: ProcessedWobjectType;
  maxReward: number;
  minReward: number;
  payoutToken: string;
  currency: string;
  reward: number;
  rewardInUSD: number;
};

export type RewardsByRequiredType = {
  object: ProcessedWobjectType;
  payoutToken: string;
  currency: string;
  reward: number;
  rewardInUSD: number;
  guideName: string;
  requirements: ReviewRequirementsType;
  userRequirements: UserRequirementsType;
};

export type GetRewardsMainType = {
  skip: number;
  limit: number;
  host: string;
};

export type GetRewardsByRequiredObjectType = {
  skip: number;
  limit: number;
  host: string;
  requiredObject: string;
};
