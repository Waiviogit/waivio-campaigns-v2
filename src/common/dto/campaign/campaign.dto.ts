import {
  IsNotEmpty,
  MaxLength,
  IsOptional,
  MinLength,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsIn,
  Min,
  Max,
  Matches,
  IsDateString,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  PAYMENT_STATUS,
  PAYOUT_TOKEN,
  RESERVATION_STATUS,
  SUPPORTED_CURRENCY,
} from '../../constants';
import {
  CampaignPaymentDocumentType,
  CampaignUserDocumentType,
} from '../../../persistance/campaign/types';
import { ObjectId, Types } from 'mongoose';
import { Prop } from '@nestjs/mongoose';

export class CampaignPaymentDto {
  @IsString()
  @ApiProperty({ type: String })
  _id: string;

  @IsString()
  @ApiProperty({ type: String })
  reservationId: string;
  @IsString()
  @ApiProperty({ type: String })
  userName: string;

  @IsString()
  @ApiProperty({ type: String })
  objectPermlink: string;

  @IsString()
  @ApiProperty({ type: String })
  rootAuthor: string;

  @IsString()
  @ApiProperty({ type: String })
  paymentPermlink: string;

  @IsString()
  @ApiProperty({ type: String })
  rejectionPermlink: string;

  @IsString()
  @ApiProperty({ type: String })
  postTitle: string;

  @IsString()
  @ApiProperty({ type: String })
  postPermlink: string;

  @IsString()
  @ApiProperty({ type: String })
  app: string;

  @IsString()
  @ApiProperty({ type: String, enum: Object.values(PAYMENT_STATUS) })
  status: string;
}

export class CampaignUserDto {
  @IsString()
  @ApiProperty({ type: String })
  _id: string;

  @IsString()
  @ApiProperty({ type: String })
  name: string;

  @IsString()
  @ApiProperty({ type: String })
  objectPermlink: string;

  @IsString()
  @ApiProperty({ type: String })
  reservationPermlink: string;

  @IsString()
  @ApiProperty({ type: String })
  referralServer: string;

  @IsString()
  @ApiProperty({ type: String })
  unReservationPermlink: string;

  @IsString()
  @ApiProperty({ type: String })
  rootName: string;

  @IsNumber()
  @ApiProperty({ type: Number })
  children: number;

  @IsString()
  @ApiProperty({ type: String })
  riseRewardPermlink: string;

  @IsNumber()
  @ApiProperty({ type: Number })
  rewardRaisedBy: number;

  @IsString()
  @ApiProperty({ type: String })
  reduceRewardPermlink: string;

  @IsNumber()
  @ApiProperty({ type: Number })
  rewardReducedBy: number;

  @IsString()
  @ApiProperty({ type: String })
  rejectionPermlink: string;

  @IsNumber()
  @ApiProperty({ type: Number })
  reservationTokenRateUSD: number;

  @IsString()
  @ApiProperty({ type: String, enum: Object.values(RESERVATION_STATUS) })
  status: string;

  @IsBoolean()
  @ApiProperty({ type: Boolean })
  fraudSuspicion: boolean;

  @IsArray()
  @ApiProperty({ type: [Number] })
  fraudCodes: number[];

  @ApiProperty({ type: Date })
  completedAt: Date;
}

class ReservationTimetableDto {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false })
  monday: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false })
  tuesday: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false })
  wednesday: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false })
  thursday: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false })
  friday: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false })
  saturday: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false })
  sunday: boolean;
}

class RequirementsDto {
  @IsNumber()
  @ApiProperty({ type: Number })
  minPhotos: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false })
  receiptPhoto: boolean;
}

class UserRequirementsDto {
  @IsNumber()
  @ApiProperty({ type: Number })
  minPosts: number;

  @IsNumber()
  @ApiProperty({ type: Number })
  minFollowers: number;

  @IsNumber()
  @ApiProperty({ type: Number })
  minExpertise: number;
}

export class CampaignDto {
  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  _id: ObjectId;

  @IsNotEmpty()
  @MaxLength(16)
  @IsString()
  @ApiProperty({ type: String })
  guideName: string;

  @IsNotEmpty()
  @MaxLength(256)
  @IsString()
  @ApiProperty({ type: String })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  @ApiProperty({ type: String, required: false })
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(CAMPAIGN_TYPE))
  @ApiProperty({
    type: String,
    required: true,
    enum: Object.values(CAMPAIGN_TYPE),
  })
  type: string;

  @IsString()
  @ApiProperty({ type: String, enum: Object.values(CAMPAIGN_STATUS) })
  status: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  note: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  compensationAccount: string;

  @IsString()
  @ApiProperty({ type: String })
  campaignServer: string;

  @IsNumber()
  @Min(0.001)
  @Max(10000)
  @ApiProperty({ type: Number, required: true })
  budget: number;

  @IsNumber()
  @Min(0.001)
  @Max(500)
  @ApiProperty({ type: Number, required: true })
  reward: number;

  @IsNumber()
  @Min(0.001)
  @Max(500)
  @ApiProperty({ type: Number, required: true })
  rewardInUSD: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false, default: 1 })
  countReservationDays: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  agreementObjects: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  usersLegalNotice: string;

  @IsOptional()
  @IsNumber()
  @Min(0.05)
  @Max(1)
  @ApiProperty({ type: Number })
  commissionAgreement: number;

  @ValidateNested()
  @Type(() => RequirementsDto)
  @ApiProperty({ type: () => RequirementsDto })
  requirements: RequirementsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserRequirementsDto)
  @ApiProperty({ type: () => UserRequirementsDto })
  userRequirements: UserRequirementsDto;

  @IsString()
  @ApiProperty({ type: String, required: true })
  requiredObject: string;

  @IsArray()
  @IsString({ each: true })
  @Matches(/\S+/, { each: true })
  @ApiProperty({ type: [String], required: true })
  objects: string[];

  @ValidateNested()
  @Type(() => CampaignUserDto)
  @ApiProperty({ type: () => [CampaignUserDto] })
  users: CampaignUserDocumentType[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  blacklistUsers: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  whitelistUsers: string[];

  @IsString()
  @ApiProperty({ type: String })
  activationPermlink: string;

  @IsString()
  @ApiProperty({ type: String })
  deactivationPermlink: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  matchBots: string[];

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false })
  frequencyAssign: number;

  @ValidateNested()
  @Type(() => CampaignPaymentDto)
  @ApiProperty({ type: () => [CampaignPaymentDto] })
  payments: CampaignPaymentDocumentType[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UserRequirementsDto)
  @ApiProperty({ type: () => ReservationTimetableDto, required: false })
  reservationTimetable: ReservationTimetableDto;

  @IsOptional()
  @MaxLength(256)
  @MinLength(1)
  @IsString()
  @ApiProperty({ type: String, required: false })
  app: string;

  @IsDateString()
  @ApiProperty({ type: Date, required: true })
  expiredAt: Date;

  @IsDateString()
  @ApiProperty({ type: Date })
  stoppedAt: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ type: Date, required: false })
  createdAt?: Date;

  @IsOptional()
  @IsIn(Object.values(SUPPORTED_CURRENCY))
  @ApiProperty({
    type: String,
    enum: Object.values(SUPPORTED_CURRENCY),
    required: false,
    default: SUPPORTED_CURRENCY.USD,
  })
  currency: string;

  @IsString()
  @IsIn(Object.values(PAYOUT_TOKEN))
  @ApiProperty({
    type: String,
    enum: Object.values(PAYOUT_TOKEN),
    required: false,
    default: PAYOUT_TOKEN.WAIV,
  })
  payoutToken: string;
}
