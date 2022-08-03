import { ProcessedWobjectType } from '../../../wobject/types';
import {
  CampaignDocumentType,
  ReviewRequirementsType,
  UserRequirementsType,
} from '../../../../persistance/campaign/types';
import { UserDocumentType } from '../../../../persistance/user/types';

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
  countReservationDays: number;
  guideName: string;
  requirements: ReviewRequirementsType;
  userRequirements: UserRequirementsType;
  totalPayed?: number;
  frequencyAssign: number;
  matchBots: string[];
  agreementObjects: string[];
  usersLegalNotice: string;
  description: string;
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
  activationPermlink?: string;
  requiredObject?: string;
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
  userName?: string;
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

export type RewardsTabType = {
  tabType: string;
};

export type CanReserveParamType = {
  userName: string;
  activationPermlink: string;
};

export type CanReserveType = {
  canAssignByBudget: boolean;
  canAssignByCurrentDay: boolean;
  posts: boolean;
  followers: boolean;
  expertise: boolean;
  notAssigned: boolean;
  frequency: boolean;
  notBlacklisted: boolean;
};

export type GetEligiblePipeType = {
  userName: string;
  user: EligiblePipeUserType;
};

export type EligiblePipeUserType = Pick<
  UserDocumentType,
  'count_posts' | 'followers_count' | 'wobjects_weight'
>;

export type ExpertiseVariablesType = {
  claims: number;
  rewardBalanceTimesRate: number;
};
