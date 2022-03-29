import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';

import {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  PAYMENT_STATUS,
  RESERVATION_STATUS,
  SUPPORTED_CURRENCY,
} from '../../common/constants';
import { configService } from '../../common/config';

@Schema({ timestamps: true })
class User {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  objectPermlink: string;

  @Prop({ type: String, required: true, index: true })
  reservationPermlink: string;

  @Prop({ type: String })
  referralServer: string;

  @Prop({ type: String })
  unReservationPermlink: string;

  @Prop({ type: String })
  rootName: string;

  @Prop({ type: String, default: 0 })
  children: string;

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
  // #TODO ??? is it price in USD?
  @Prop({ type: Number, required: true })
  reservationTokenRateUSD: number;
  // hiveCurrency: number;

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

  @Prop({ type: Boolean })
  fraudCodes: boolean;

  @Prop({ type: Date })
  completedAt: Date;
}

@Schema({ timestamps: true })
class Payment {
  @Prop({ type: Types.ObjectId, required: true })
  reservationId: string;

  @Prop({ type: String, required: true })
  userName: string;

  @Prop({ type: String, required: true })
  objectPermlink: string;

  @Prop({ type: String, required: true })
  rootAuthor: string;

  @Prop({ type: String })
  paymentPermlink: string;

  @Prop({ type: String })
  rejectionPermlink: string;

  @Prop({ type: String, required: true })
  postTitle: string;

  @Prop({ type: String, required: true })
  postPermlink: string;

  @Prop({ type: String })
  app: string;

  @Prop({
    type: String,
    default: PAYMENT_STATUS.ACTIVE,
    enum: Object.values(PAYMENT_STATUS),
  })
  status: string;
}

@Schema({ timestamps: true })
export class Campaign {
  @Transform(({ value }) => value.toString())
  _id: string;

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
  rewardInCurrency: number;

  @Prop({ type: Number, default: 1 })
  countReservationDays: number;

  @Prop({ type: [String] })
  agreementObjects: string[];

  @Prop({ type: [String], maxlength: 2000 })
  usersLegalNotice: string[];

  @Prop({ type: Number, min: 0.05, max: 1, default: 0.05 })
  commissionAgreement: number;

  @Prop(
    raw({
      minPhotos: { type: Number, required: true },
      receiptPhoto: { type: Boolean, default: false },
    }),
  )
  requirements: Record<string, unknown>;

  @Prop(
    raw({
      minPosts: { type: Number, default: 0 },
      minFollowers: { type: Number, default: 0 },
      minExpertise: { type: Number, default: 0 },
    }),
  )
  userRequirements: Record<string, number>;

  @Prop({ type: String, required: true })
  requiredObject: string;

  @Prop({ type: [String], validate: /\S+/, required: true })
  objects: string[];

  @Prop()
  users: User[];

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

  @Prop()
  payments: Payment[];

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
  reservationTimetable: Record<string, boolean>;

  @Prop({ type: String, default: null })
  app: string;

  @Prop({ type: Date })
  expiredAt: Date;

  @Prop({ type: Date })
  stoppedAt: Date;

  @Prop({
    type: String,
    default: SUPPORTED_CURRENCY.USD,
    enum: Object.values(SUPPORTED_CURRENCY),
  })
  currency: string;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
export type CampaignDocumentType = Campaign & Document;