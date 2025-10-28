import {
  CampaignUserDocumentType,
  ContestRewardType,
  ReviewRequirementsType,
  UserRequirementsType,
} from '../../../persistance/campaign/types';
import { ObjectId } from 'mongoose';

export type GuideManageCampaignType = {
  _id: ObjectId;
  agreementObjects: string[];
  budget: number;
  budgetUSD: number;
  name: string;
  activationPermlink: string;
  status: string;
  type: string;
  users: CampaignUserDocumentType[];
  reward: number;
  rewardInUSD: number;
  reserved: number;
  completed: number;
  completedTotal: number;
  requiredObject: string;
  requirements: ReviewRequirementsType;
  userRequirements: UserRequirementsType;
  expiredAt: Date;
  createdAt: Date;
  guideName: string;
  currency: string;
  commissionAgreement: number;
  remaining: number;
  contestRewards?: ContestRewardType[];
  recurrenceRule?: string;
  winnersNumber?: number;
};

export type ReservedCampaigns = {
  _id: ObjectId;
  reserved: number;
  rewardInUSD: number;
  commissionAgreement: number;
};

export type GuideBalanceType = {
  balance: number;
  payable: number;
  reserved: number;
  remaining: number;
};

export type getInactiveCampaignsType = {
  guideName: string;
  skip?: number;
  limit?: number;
};

export type InactiveCampaignsType = {
  campaigns: GuideManageCampaignType[];
  hasMore: boolean;
};
