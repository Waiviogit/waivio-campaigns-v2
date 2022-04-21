import {
  CampaignUserDocumentType,
  ReviewRequirementsType,
  UserRequirementsType,
} from '../../../persistance/campaign/types';
import { ObjectId } from 'mongoose';

export type GuideActiveCampaignType = {
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
};
