import { PipelineStage } from 'mongoose';

import { Campaign } from '../campaign.schema';

export type ActivateCampaignType = {
  _id: string;
  guideName: string;
  status: string;
  permlink: string;
};

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
>;

export type UpdateCampaignType = Partial<
  Omit<
    Campaign,
    | 'guideName'
    | 'status'
    | 'campaignServer'
    | 'users'
    | 'activationPermlink'
    | 'deactivationPermlink'
    | 'payments'
    | 'canAssign'
  >
>;

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
