import { Beneficiary, MetadataType } from '../../../hive-parser/types';
import { CampaignDocumentType } from '../../../../persistance/campaign/types';
import { ObjectId } from 'mongoose';
import { HiveCommentType } from '../../../../common/types';
import BigNumber from 'bignumber.js';

export type ReviewCampaignType = Pick<
  CampaignDocumentType,
  | 'activationPermlink'
  | 'requiredObject'
  | 'userRequirements'
  | 'rewardInUSD'
  | 'requirements'
  | 'payoutToken'
  | 'currency'
  | 'reward'
  | 'commissionAgreement'
  | 'matchBots'
  | 'type'
  | 'guideName'
> & {
  campaignServer: string;
  campaignId: ObjectId;
  payoutTokenRateUSD: number;
  reservedAt: string;
  userReservationPermlink: string;
  userReservationObject: string;
  userStatus: string;
  referralServer: string;
  rewardRaisedBy: string;
  userName: string;
  userId: ObjectId;
};

export type ValidateReviewType = {
  campaigns: ReviewCampaignType[];
  metadata: MetadataType;
  postAuthor: string;
};

export type CreateReviewType = {
  campaign: ReviewCampaignType;
  botName?: string;
  beneficiaries: Beneficiary[];
  objects: string[];
  title: string;
  app: string;
  host: string;
  images: string[];
  reviewPermlink: string;
};

export type ParseReviewType = {
  comment: HiveCommentType;
  metadata: MetadataType;
  app: string;
  beneficiaries: Beneficiary[];
};

export type ReviewCommissionsType = {
  indexCommission: number;
  indexAccount: string;
  campaignsCommission: number;
  campaignsAccount: string;
  referralAccount: string;
};

export type GetCommissionPaymentsType = {
  rewardInToken: BigNumber;
  commission: number;
  tokenPrecision: number;
  referralAgent: string;
  appHost: string;
  referralHost: string;
};

export type CampaignPaymentType = {
  amount: BigNumber;
  commission?: BigNumber;
  weight?: number;
  account: string;
  type: string;
};

export type GetReviewPaymentType = {
  userName: string;
  rewardInToken: BigNumber;
  beneficiariesPayments: CampaignPaymentType[];
};

export type GetBeneficiariesPaymentsType = {
  beneficiaries: Beneficiary[];
  rewardInToken: BigNumber;
  tokenPrecision: number;
};

export type GetCampaignPaymentsType = Pick<
  CreateReviewType,
  'campaign' | 'beneficiaries' | 'host'
> & {
  isGuest: boolean;
};

export type UpdateUserStatusType = {
  campaignId: ObjectId;
  userId: ObjectId;
  fraud: boolean;
  fraudCodes: string[];
};

export type CreateCampaignPaymentsType = {
  payments: CampaignPaymentType[];
  campaign: ReviewCampaignType;
  title: string;
  app: string;
  reviewPermlink: string;
  botName?: string;
};
