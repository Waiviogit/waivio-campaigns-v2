import { PipelineStage } from 'mongoose';

import { Campaign } from '../campaign.schema';
import { ContestRewardType } from './campaign.types';

export type ActivateCampaignType = {
  _id: string;
  guideName: string;
  status: string;
  permlink: string;
};

// Input type for contest rewards without rewardInUSD
export type ContestRewardInputType = {
  place: number;
  reward: number;
};

// Create campaign type with input contest rewards
export type CreateCampaignType = Omit<
  Campaign,
  | '_id'
  | 'status'
  | 'campaignServer'
  | 'users'
  | 'activationPermlink'
  | 'deactivationPermlink'
  | 'payments'
  | 'canAssign'
  | 'contestRewards'
  | 'rewardInUSD'
> & {
  contestRewards?: ContestRewardInputType[] | ContestRewardType[];
};

// Create campaign type for repository (includes rewardInUSD)
export type CreateCampaignRepositoryType = Omit<
  Campaign,
  | '_id'
  | 'status'
  | 'campaignServer'
  | 'users'
  | 'activationPermlink'
  | 'deactivationPermlink'
  | 'payments'
  | 'canAssign'
  | 'contestRewards'
> & {
  contestRewards?: ContestRewardInputType[] | ContestRewardType[];
};

// Update campaign type with input contest rewards
export type UpdateCampaignType = Partial<
  Omit<
    Campaign,
    | 'guideName'
    | 'campaignServer'
    | 'deactivationPermlink'
    | 'payments'
    | 'canAssign'
    | 'contestRewards'
  >
> & {
  contestRewards?: ContestRewardInputType[];
};

export type DeleteCampaignType = Pick<Campaign, '_id'>;

export type findCampaignByStatusGuideNameActivation = {
  statuses: string[];
  guideName: string;
  activationPermlink: string;
};

export type AggregateType = {
  pipeline: PipelineStage[];
  options?: unknown;
};
