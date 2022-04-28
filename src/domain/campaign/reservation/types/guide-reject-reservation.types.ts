import { ObjectId } from 'mongoose';
import { CampaignUserDocumentType } from '../../../../persistance/campaign/types';

export type GuideRejectReservationType = {
  reservationPermlink: string;
  guideName: string;
  rejectionPermlink: string;
};

export type UpdateCampaignReviewType = {
  _id: ObjectId;
  user: CampaignUserDocumentType;
  rejectionPermlink: string;
};
