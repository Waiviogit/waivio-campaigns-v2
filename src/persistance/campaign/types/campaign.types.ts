import { Document } from 'mongoose';

import { Campaign, CampaignUser } from '../campaign.schema';

export type ReviewRequirementsType = {
  minPhotos: number;
  receiptPhoto: boolean;
};

export interface GiveawayRequirements {
  likePost: boolean;
  comment: boolean;
  tagInComment: boolean;
  reblog: boolean;
}

export type UserRequirementsType = {
  minPosts: number;
  minFollowers: number;
  minExpertise: number;
};

export type ReservationTimetableType = {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
};

export type CampaignUserDocumentType = CampaignUser & Document;

// export type CampaignPaymentDocumentType = CampaignPayment & Document;

export type CampaignDocumentType = Campaign & Document;
