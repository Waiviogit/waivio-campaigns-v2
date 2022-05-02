import { ObjectId } from 'mongoose';

export type GetCompletedUsersInSameCampaignsType = {
  guideName: string;
  requiredObject: string;
  userName: string;
};

export type AggregateSameUserReservationType = SameUserReservationType[];

export type SameUserReservationType = {
  completedUser: CompletedUserType;
  assignedUser: unknown;
};

export type CompletedUserType = {
  updatedAt: string;
};

export type GetCompletedUsersInSameCampaignsOutType = {
  lastCompleted: number | null;
  assignedUser: unknown;
};

export type SetExpireAssignType = {
  activationPermlink: string;
  reservationPermlink: string;
  requiredObject: string;
  name: string;
  reservationTime: number;
};

export type SetExpireSuspendWarningType = {
  userReservationPermlink: string;
  expire: number;
  daysToSuspend: string;
  campaignId: ObjectId;
};
