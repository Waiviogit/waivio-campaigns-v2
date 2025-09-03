import { ObjectId } from 'mongoose';
import {
  GetCompletedUsersInSameCampaignsOutType,
  GetCompletedUsersInSameCampaignsType,
  SetExpireAssignType,
  SetExpireSuspendWarningType,
} from '../types';

export interface CampaignHelperInterface {
  setExpireTTLCampaign(expiredAt: Date, _id: ObjectId | string): Promise<void>;
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

  incrReviewComment(params: IncrReviewCommentInterface): Promise<void>;
  reCalcCampaignsRewardInUsd(): Promise<void>;
  reachedLimitUpdateToActive(): Promise<void>;
  setNextRecurrentEvent(
    rruleString: string,
    _id: string,
    recurrentKey: string,
  ): Promise<void>;
}

export interface IncrReviewCommentInterface {
  author: string;
  permlink: string;
  rootName: string;
  reservationPermlink: string;
  isOpen?: boolean;
  rootPermlink?: string;
}
