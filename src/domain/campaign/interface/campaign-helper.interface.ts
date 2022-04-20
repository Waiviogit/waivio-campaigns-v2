import { ObjectId } from 'mongoose';
import {
  GetCompletedUsersInSameCampaignsOutType,
  GetCompletedUsersInSameCampaignsType,
  SetExpireAssignType,
} from '../types';

export interface CampaignHelperInterface {
  setExpireTTLCampaign(expiredAt: Date, _id: ObjectId): Promise<void>;
  deleteCampaignKey(key: string): Promise<void>;
  getCompletedUsersInSameCampaigns({
    guideName,
    requiredObject,
    userName,
  }: GetCompletedUsersInSameCampaignsType): Promise<GetCompletedUsersInSameCampaignsOutType>;
  setExpireAssign({
    activationPermlink,
    reservationPermlink,
    requiredObject,
    name,
    reservationTime,
  }: SetExpireAssignType): Promise<void>;
  getPayoutTokenRateUSD(token: string): Promise<number>;
  getRewardInUSD(currency: string, reward: number): Promise<number>;
}
