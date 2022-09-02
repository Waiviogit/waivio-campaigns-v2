import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

import {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  PAYOUT_TOKEN,
  RESERVATION_STATUS,
  SUPPORTED_CURRENCY,
} from '../../common/constants';
import { configService } from '../../common/config';
import {
  CampaignUserDocumentType,
  ReservationTimetableType,
  ReviewRequirementsType,
  UserRequirementsType,
} from './types';

@Schema({ timestamps: true })
export class CampaignUser {
  _id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  objectPermlink: string;

  @Prop({ type: String, required: true, index: true })
  reservationPermlink: string;

  @Prop({ type: String })
  reviewPermlink?: string;

  @Prop({ type: String })
  referralServer: string;

  @Prop({ type: String })
  unReservationPermlink: string;

  @Prop({ type: String })
  rootName: string;

  @Prop({ type: String })
  riseRewardPermlink: string;

  @Prop({ type: Number, default: 0 })
  rewardRaisedBy: number;

  @Prop({ type: String })
  reduceRewardPermlink: string;

  @Prop({ type: Number, default: 0 })
  rewardReducedBy: number;

  @Prop({ type: String })
  rejectionPermlink: string;

  @Prop({ type: Number, required: true })
  payoutTokenRateUSD: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(RESERVATION_STATUS),
    default: RESERVATION_STATUS.ASSIGNED,
    index: true,
  })
  status: string;

  @Prop({ type: Boolean })
  fraudSuspicion: boolean;

  @Prop({ type: Boolean, default: true })
  openConversation: boolean;

  @Prop({ type: [Number] })
  fraudCodes: number[];

  @Prop({ type: Date })
  completedAt: Date;

  @Prop({ type: Number, default: 0 })
  commentsCount: number;
}

export const CampaignUserSchema = SchemaFactory.createForClass(CampaignUser);

@Schema({ timestamps: true })
export class Campaign {
  _id: ObjectId;

  @Prop({ type: String, required: true, index: true })
  guideName: string;

  @Prop({ type: String, required: true, maxlength: 256, index: true })
  name: string;

  @Prop({ type: String, maxlength: 512 })
  description: string;

  @Prop({ type: String, required: true, enum: Object.values(CAMPAIGN_TYPE) })
  type: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(CAMPAIGN_STATUS),
    default: CAMPAIGN_STATUS.PENDING,
  })
  status: string;

  @Prop({ type: String, maxlength: 512 })
  note: string;

  @Prop({ type: String })
  compensationAccount: string;

  @Prop({ type: String, default: () => configService.getAppHost() })
  campaignServer: string;

  @Prop({ type: Number, required: true, min: 0.001, max: 10000 })
  budget: number;

  @Prop({ type: Number, required: true, min: 0.001, max: 500 })
  reward: number;

  @Prop({ type: Number, required: true, min: 0.001, max: 50000 })
  rewardInUSD: number;

  @Prop({ type: Number, default: 1 })
  countReservationDays: number;

  @Prop({ type: [String] })
  agreementObjects: string[];

  @Prop({ type: String, maxlength: 2000 })
  usersLegalNotice: string;

  @Prop({ type: Number, min: 0.05, max: 1, default: 0.05 })
  commissionAgreement: number;

  @Prop(
    raw({
      minPhotos: { type: Number, required: true },
      receiptPhoto: { type: Boolean, default: false },
    }),
  )
  requirements: ReviewRequirementsType;

  @Prop(
    raw({
      minPosts: { type: Number, default: 0 },
      minFollowers: { type: Number, default: 0 },
      minExpertise: { type: Number, default: 0 },
    }),
  )
  userRequirements: UserRequirementsType;

  @Prop({ type: String, required: true, index: true })
  requiredObject: string;

  @Prop({ type: [String], validate: /\S+/, required: true })
  objects: string[];

  @Prop({ type: [CampaignUserSchema], default: [] })
  users: CampaignUserDocumentType[];

  @Prop({ type: [String] })
  blacklistUsers: string[];

  @Prop({ type: [String] })
  whitelistUsers: string[];

  @Prop({ type: String, index: true })
  activationPermlink: string;

  @Prop({ type: String, index: true })
  deactivationPermlink: string;

  @Prop({ type: [String] })
  matchBots: string[];

  @Prop({ type: Number, max: 300, default: 0 })
  frequencyAssign: number;

  @Prop(
    raw({
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true },
    }),
  )
  reservationTimetable: ReservationTimetableType;

  @Prop({ type: String, default: null })
  app: string;

  @Prop({ type: Date, required: true })
  expiredAt: Date;

  @Prop({ type: Date })
  stoppedAt?: Date;

  createdAt?: Date;

  @Prop({
    type: String,
    default: SUPPORTED_CURRENCY.USD,
    enum: Object.values(SUPPORTED_CURRENCY),
  })
  currency: string;

  canAssign: boolean;

  @Prop({
    type: String,
    default: PAYOUT_TOKEN.WAIV,
    enum: Object.values(PAYOUT_TOKEN),
  })
  payoutToken: string;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

CampaignSchema.index({ createdAt: -1 });
CampaignSchema.index({ reward: -1 });
CampaignSchema.index({ rewardInUSD: -1 });
CampaignSchema.index({ userName: 1, postPermlink: 1 });

//TODO validate in dto
// CampaignSchema.pre('save', function (next) {
//   if (this.reward > this.budget) {
//     const error = new Error('Reward more than budget');
//
//     return next(error);
//   }
//   next();
// });
