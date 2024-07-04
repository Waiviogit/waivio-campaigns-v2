import { Document } from 'mongoose';
import { Referral, User, UserMetadata } from '../user.schema';

export type UserMetadataSettingsType = {
  exitPageSetting: boolean;
  locale: string;
  postLocales: string[];
  nightmode: boolean;
  rewardSetting: string;
  rewriteLinks: boolean;
  showNSFWPosts: boolean;
  upvoteSetting: boolean;
  hiveBeneficiaryAccount: string;
  votePercent: number;
  votingPower: boolean;
};

export type UserDraftType = {
  title: string;
  draftId: string;
  author: string;
  beneficiary: boolean;
  upvote: boolean;
  isUpdating: boolean;
  body: string;
  originalBody: string;
  jsonMetadata: unknown;
  lastUpdated: number;
  parentAuthor: string;
  parentPermlink: string;
  permlink: string;
  reward: string;
};

export type AuthType = {
  id: string;
  provider: string;
};

export type ReferralDocumentType = Referral & Document;

export type UserMetadataDocumentType = UserMetadata & Document;

export type UserDocumentType = User & Document;

export type UserCampaignType = Pick<
  UserDocumentType,
  | 'name'
  | 'alias'
  | 'profile_image'
  | 'wobjects_weight'
  | 'posting_json_metadata'
>;
