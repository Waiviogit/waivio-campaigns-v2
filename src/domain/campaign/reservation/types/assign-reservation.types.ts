import { CampaignDocumentType } from '../../../../persistance/campaign/types';

export type validateAssignType = {
  isValid: boolean;
  message?: string;
  campaign?: CampaignDocumentType;
  limitReservationDays?: number;
  reservationTime?: number;
};

export type AssignReservationType = {
  activationPermlink: string;
  name: string;
  requiredObject: string;
  reservationPermlink: string;
  rootName: string;
  referralServer: string;
  payoutTokenRateUSD?: number;
};

export type ValidateAssignType = Omit<
  AssignReservationType,
  'rootName' | 'referralServer'
>;

export type CheckReserveInSameCampaignsType = {
  name: string;
  guideName: string;
  requiredObject: string;
};

export type CountReservationDaysType = Pick<
  CampaignDocumentType,
  'reservationTimetable' | 'countReservationDays'
>;
