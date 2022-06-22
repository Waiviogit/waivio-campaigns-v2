import { ProcessedWobjectType } from '../../../wobject/types';
import {
  CampaignDocumentType,
  ReviewRequirementsType,
  UserRequirementsType,
} from '../../../../persistance/campaign/types';

export type RewardsMainType = {
  object: ProcessedWobjectType;
  maxReward: number;
  minReward: number;
  distance: number | null;
};

export type RewardsAllType = {
  rewards: RewardsMainType[];
  hasMore: boolean;
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

export type RewardsByObjectType = {
  rewards: RewardsByRequiredType[];
  hasMore: boolean;
};

export type GetRewardsMainType = {
  skip?: number;
  limit?: number;
  host: string;
  sponsors?: string[];
  type?: string[];
  sort?: string;
  area?: number[];
};

export type GetReservedType = GetRewardsMainType & {
  userName: string;
};

export type GetRewardsEligibleType = GetRewardsMainType & {
  userName?: string;
};

export type GetPrimaryObjectRewards = GetRewardsMainType & {
  campaigns: CampaignDocumentType[];
};

export type GetRewardsByRequiredObjectType = {
  skip?: number;
  limit?: number;
  host: string;
  requiredObject: string;
  sponsors?: string[];
  type?: string[];
  sort?: string;
  area?: number[];
};

export type GetSponsorsType = {
  type: string[];
  sponsors: string[];
};

export type GetSortedCampaignMainType = {
  sort?: string;
  rewards: RewardsMainType[];
};

export type GetSortedRewardsReservedType = {
  sort?: string;
  rewards: RewardsByRequiredType[];
};
