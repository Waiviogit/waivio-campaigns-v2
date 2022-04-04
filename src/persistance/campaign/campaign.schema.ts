import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';
import { Transform } from 'class-transformer';

import {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  PAYMENT_STATUS,
  RESERVATION_STATUS,
  SUPPORTED_CURRENCY,
} from '../../common/constants';
import { configService } from '../../common/config';
import { ApiProperty } from '@nestjs/swagger';
import {
  CampaignPaymentDocumentType,
  CampaignUserDocumentType,
  ReservationTimetableType,
  ReviewRequirementsType,
  UserRequirementsType,
} from './types';

@Schema({ timestamps: true })
export class CampaignUser {
  @ApiProperty({ type: String })
  @Transform(({ value }) => value.toString())
  _id: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true })
  objectPermlink: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true, index: true })
  reservationPermlink: string;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  referralServer: string;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  unReservationPermlink: string;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  rootName: string;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  children: number;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  riseRewardPermlink: string;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  rewardRaisedBy: number;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  reduceRewardPermlink: string;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  rewardReducedBy: number;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  rejectionPermlink: string;
  // #TODO ??? is it price in USD?
  @ApiProperty({ type: Number })
  @Prop({ type: Number, required: true })
  reservationTokenRateUSD: number;
  // hiveCurrency: number;
  @ApiProperty({ type: String })
  @Prop({
    type: String,
    required: true,
    enum: Object.values(RESERVATION_STATUS),
    default: RESERVATION_STATUS.ASSIGNED,
    index: true,
  })
  status: string;

  @ApiProperty({ type: Boolean })
  @Prop({ type: Boolean })
  fraudSuspicion: boolean;

  @ApiProperty({ type: Boolean })
  @Prop({ type: Boolean })
  fraudCodes: boolean;

  @ApiProperty({ type: Date })
  @Prop({ type: Date })
  completedAt: Date;
}

export const CampaignUserSchema = SchemaFactory.createForClass(CampaignUser);

@Schema({ timestamps: true })
export class CampaignPayment {
  @ApiProperty({ type: String })
  @Transform(({ value }) => value.toString())
  _id: string;

  @ApiProperty({ type: String })
  @Prop({ type: Types.ObjectId, required: true })
  reservationId: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true })
  userName: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true })
  objectPermlink: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true })
  rootAuthor: string;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  paymentPermlink: string;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  rejectionPermlink: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true })
  postTitle: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true })
  postPermlink: string;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  app: string;

  @ApiProperty({ type: String })
  @Prop({
    type: String,
    default: PAYMENT_STATUS.ACTIVE,
    enum: Object.values(PAYMENT_STATUS),
  })
  status: string;
}

export const CampaignPaymentSchema =
  SchemaFactory.createForClass(CampaignPayment);

@Schema({ timestamps: true })
export class Campaign {
  @ApiProperty({ type: String })
  _id: ObjectId;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true, index: true })
  guideName: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true, maxlength: 256, index: true })
  name: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, maxlength: 512 })
  description: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true, enum: Object.values(CAMPAIGN_TYPE) })
  type: string;

  @ApiProperty({ type: String })
  @Prop({
    type: String,
    required: true,
    enum: Object.values(CAMPAIGN_STATUS),
    default: CAMPAIGN_STATUS.PENDING,
  })
  status: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, maxlength: 512 })
  note: string;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  compensationAccount: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, default: () => configService.getAppHost() })
  campaignServer: string;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, required: true, min: 0.001, max: 10000 })
  budget: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, required: true, min: 0.001, max: 500 })
  reward: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, required: true, min: 0.001, max: 50000 })
  rewardInCurrency: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 1 })
  countReservationDays: number;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String] })
  agreementObjects: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], maxlength: 2000 })
  usersLegalNotice: string[];

  @ApiProperty({ type: Number })
  @Prop({ type: Number, min: 0.05, max: 1, default: 0.05 })
  commissionAgreement: number;

  //need class for api property
  @ApiProperty()
  @Prop(
    raw({
      minPhotos: { type: Number, required: true },
      receiptPhoto: { type: Boolean, default: false },
    }),
  )
  requirements: ReviewRequirementsType;

  //need class for api property
  @ApiProperty()
  @Prop(
    raw({
      minPosts: { type: Number, default: 0 },
      minFollowers: { type: Number, default: 0 },
      minExpertise: { type: Number, default: 0 },
    }),
  )
  userRequirements: UserRequirementsType;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: true })
  requiredObject: string;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], validate: /\S+/, required: true })
  objects: string[];

  @ApiProperty({ type: [CampaignUser] })
  @Prop({ type: [CampaignUserSchema], default: [] })
  users: CampaignUserDocumentType[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String] })
  blacklistUsers: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String] })
  whitelistUsers: string[];

  @ApiProperty({ type: String })
  @Prop({ type: String, index: true })
  activationPermlink: string;

  @ApiProperty({ type: String })
  @Prop({ type: String, index: true })
  deactivationPermlink: string;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String] })
  matchBots: string[];

  @ApiProperty({ type: Number })
  @Prop({ type: Number, max: 300, default: 0 })
  frequencyAssign: number;

  @ApiProperty({ type: [CampaignPayment] })
  @Prop({ type: [CampaignPaymentSchema], default: [] })
  payments: CampaignPaymentDocumentType[];

  @ApiProperty()
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

  @ApiProperty({ type: String })
  @Prop({ type: String, default: null })
  app: string;

  @ApiProperty({ type: Date })
  @Prop({ type: Date, required: true })
  expiredAt: Date;

  @ApiProperty({ type: Date })
  @Prop({ type: Date })
  stoppedAt: Date;

  @ApiProperty({ type: String, enum: Object.values(SUPPORTED_CURRENCY) })
  @Prop({
    type: String,
    default: SUPPORTED_CURRENCY.USD,
    enum: Object.values(SUPPORTED_CURRENCY),
  })
  currency: string;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
