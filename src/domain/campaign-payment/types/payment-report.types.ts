import { CampaignPaymentDocumentType } from '../../../persistance/campaign-payment/types';
import { ReservationDetailsObjectType } from '../../campaign/reservation/types/reservation-details.types';

export type UserReportType = {
  name: string;
  wobjects_weight: number;
  alias: string;
  json_metadata: string;
};

export type SingleReportType = {
  user: UserReportType;
  sponsor: UserReportType;
  histories: CampaignPaymentDocumentType[];
  rewardTokenAmount: number;
  rewardUsd: number;
  requiredObject: ReservationDetailsObjectType;
  secondaryObject: ReservationDetailsObjectType;
  activationPermlink: string;
  reservationPermlink: string;
  title: string;
  reviewDate: string;
  reservationDate: string;
  createCampaignDate: string;
  matchBots: string[];
};
