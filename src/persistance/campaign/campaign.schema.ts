import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform } from 'class-transformer';

import {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  PAYMENT_STATUS,
  RESERVATION_STATUS,
  SUPPORTED_CURRENCY,
} from '../../common/constants';
import { configService } from '../../common/config';

@Schema({ id: false })
class Requirements {
  @Prop({ required: true })
  minPhotos: number;

  @Prop({ default: false })
  receiptPhoto: boolean;
}

@Schema({ id: false })
class UserRequirements {
  @Prop({ default: 0 })
  minPosts: number;

  @Prop({ default: 0 })
  minFollowers: number;

  @Prop({ default: 0 })
  minExpertise: number;
}

@Schema({ id: false })
class ReservationTimetable {
  @Prop({ default: true })
  monday: boolean;

  @Prop({ default: true })
  tuesday: boolean;

  @Prop({ default: true })
  wednesday: boolean;

  @Prop({ default: true })
  thursday: boolean;

  @Prop({ default: true })
  friday: boolean;

  @Prop({ default: true })
  saturday: boolean;

  @Prop({ default: true })
  sunday: boolean;
}

@Schema({ timestamps: true })
class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  objectPermlink: string;

  @Prop({ required: true, index: true })
  reservationPermlink: string;

  @Prop()
  referralServer: string;

  @Prop()
  unReservationPermlink: string;

  @Prop()
  rootName: string;

  @Prop({ default: 0 })
  children: string;

  @Prop()
  riseRewardPermlink: string;

  @Prop({ default: 0 })
  rewardRaisedBy: number;

  @Prop()
  reduceRewardPermlink: string;

  @Prop({ default: 0 })
  rewardReducedBy: number;

  @Prop()
  rejectionPermlink: string;
  // #TODO ??? is it price in USD?
  @Prop({ required: true })
  reservationTokenRateUSD: number;
  // hiveCurrency: number;

  @Prop({
    required: true,
    enum: Object.values(RESERVATION_STATUS),
    default: RESERVATION_STATUS.ASSIGNED,
    index: true,
  })
  status: string;

  @Prop()
  fraudSuspicion: boolean;

  @Prop()
  fraudCodes: boolean;

  @Prop()
  completedAt: Date;
}

@Schema({ timestamps: true })
class Payment {
  @Prop({ required: true })
  // reservationId: ObjectId;
  reservationId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  objectPermlink: string;

  @Prop({ required: true })
  rootAuthor: string;

  @Prop()
  paymentPermlink: string;

  @Prop()
  rejectionPermlink: string;

  @Prop({ required: true })
  postTitle: string;

  @Prop({ required: true })
  postPermlink: string;

  @Prop()
  app: string;

  @Prop({ default: PAYMENT_STATUS.ACTIVE, enum: Object.values(PAYMENT_STATUS) })
  status: string;
}

@Schema({ timestamps: true })
export class Campaign {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop({ required: true, index: true })
  guideName: string;

  @Prop({ required: true, maxlength: 256, index: true })
  name: string;

  @Prop({ maxlength: 512 })
  description: string;

  @Prop({ required: true, enum: Object.values(CAMPAIGN_TYPE) })
  type: string;

  @Prop({
    required: true,
    enum: Object.values(CAMPAIGN_STATUS),
    default: CAMPAIGN_STATUS.PENDING,
  })
  status: string;

  @Prop({ maxlength: 512 })
  note: string;

  @Prop()
  compensationAccount: string;

  @Prop({ default: () => configService.getAppHost() })
  campaignServer: string;
  //decimal 128 transform
  @Prop({ required: true, min: 0.001, max: 10000 })
  budget: number;
  //decimal 128 transform
  @Prop({ required: true, min: 0.001, max: 500 })
  reward: number;

  @Prop({ default: 1 })
  countReservationDays: number;

  @Prop()
  agreementObjects: string[];

  @Prop({ maxlength: 2000 })
  usersLegalNotice: string[];

  @Prop({ min: 0.05, max: 1, default: 0.05 })
  commissionAgreement: number;

  @Prop()
  requirements: Requirements;

  @Prop()
  userRequirements: UserRequirements;

  @Prop({ required: true })
  requiredObject: string;

  @Prop({ validate: /\S+/, required: true })
  objects: string[];

  @Prop()
  users: User[];

  @Prop()
  blacklistUsers: string[];

  @Prop()
  whitelistUsers: string[];

  @Prop({ index: true })
  activationPermlink: string;

  @Prop({ index: true })
  deactivationPermlink: string;

  @Prop()
  matchBots: string[];

  @Prop({ max: 300, default: 0 })
  frequencyAssign: number;

  @Prop()
  payments: Payment[];

  @Prop()
  reservationTimetable: ReservationTimetable;

  @Prop({ default: null })
  app: string;

  @Prop()
  expiredAt: Date;

  @Prop()
  stoppedAt: Date;

  @Prop({
    default: SUPPORTED_CURRENCY.USD,
    enum: Object.values(SUPPORTED_CURRENCY),
  })
  currency: string;

  @Prop({ required: true, min: 0.001, max: 50000 })
  rewardInCurrency: number;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
export type CampaignDocumentType = Campaign & Document;
