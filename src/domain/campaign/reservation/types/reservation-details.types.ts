import {
  ReviewRequirementsType,
  UserRequirementsType,
} from '../../../../persistance/campaign/types';

export type GetReservationDetailsType = {
  _id: string;
  requiredObject: ReservationDetailsObjectType;
  secondaryObject: ReservationDetailsObjectType;
  app: string;
  name: string;
  guideName: string;
  requirements: ReviewRequirementsType;
  userRequirements: UserRequirementsType;
  reservationPermlink: string;
};

export type ReservationDetailsObjectType = {
  default_name: string;
  author_permlink: string;
  name: string;
};

export type reservationCountType = {
  count: number;
};
