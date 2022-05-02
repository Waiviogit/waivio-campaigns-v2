import { ObjectId } from 'mongoose';
import {
  GetCompletedUsersInSameCampaignsOutType,
  GetCompletedUsersInSameCampaignsType,
  SetExpireAssignType,
  SetExpireSuspendWarningType,
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
  getCurrencyInUSD(currency: string, amount: number): Promise<number>;
  delExpireAssign(reservationPermlink: string): Promise<void>;
  checkOnHoldStatus(activationPermlink: string): Promise<void>;
  setExpireCampaignPayment(
    paymentId: ObjectId,
    campaignId: ObjectId,
  ): Promise<void>;
  setExpireSuspendWarning({
    userReservationPermlink,
    expire,
    daysToSuspend,
    campaignId,
  }: SetExpireSuspendWarningType): Promise<void>;
}
