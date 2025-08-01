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
  IsMongoId,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
  PAYOUT_TOKEN,
  REACH_TYPE,
  RESERVATION_STATUS,
  SUPPORTED_CURRENCY,
} from '../../constants';
import { CampaignUserDocumentType } from '../../../persistance/campaign/types';
import { ObjectId } from 'mongoose';
import * as moment from 'moment-timezone';
import { RRule } from 'rrule';

@ValidatorConstraint({ name: 'isTimezone', async: false })
export class IsTimezoneConstraint implements ValidatorConstraintInterface {
  validate(timezone: string, args: ValidationArguments): boolean {
    return moment.tz.zone(timezone) !== null;
  }
  defaultMessage(args: ValidationArguments): string {
    return 'Timezone ($value) is not a valid IANA timezone';
  }
}

@ValidatorConstraint({ name: 'isRRule', async: false })
class IsRRuleConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (typeof value !== 'string') return false;
    try {
      RRule.fromString(value);
      return true;
    } catch {
      return false;
    }
  }
  defaultMessage(): string {
    return 'recurrenceRule must be a valid RRULE string';
  }
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
  @IsOptional()
  @ApiProperty({ type: String })
  reviewPermlink?: string;

  @IsString()
  @ApiProperty({ type: String })
  referralServer: string;

  @IsString()
  @ApiProperty({ type: String })
  unReservationPermlink: string;

  @IsString()
  @ApiProperty({ type: String })
  rootName: string;

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

export class RequirementsDto {
  @IsNumber()
  @ApiProperty({ type: Number })
  minPhotos: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean, required: false })
  receiptPhoto: boolean;
}

export class UserRequirementsDto {
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

export class GiveawayRequirementsDto {
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  follow: boolean;

  @IsBoolean()
  @ApiProperty({ type: Boolean })
  likePost: boolean;

  @IsBoolean()
  @ApiProperty({ type: Boolean })
  comment: boolean;

  @IsBoolean()
  @ApiProperty({ type: Boolean })
  tagInComment: boolean;

  @IsBoolean()
  @ApiProperty({ type: Boolean })
  reblog: boolean;
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

  @IsOptional()
  @IsString()
  @MaxLength(512)
  @ApiProperty({ type: String, required: false })
  imageToDisplay?: string;

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
  @MaxLength(512)
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
  @MaxLength(2000)
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

  @ValidateIf((o) => o.type === CAMPAIGN_TYPE.GIVEAWAYS)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => GiveawayRequirementsDto)
  @ApiProperty({ type: () => GiveawayRequirementsDto })
  giveawayRequirements?: GiveawayRequirementsDto;

  @ValidateIf((o) => o.type === CAMPAIGN_TYPE.GIVEAWAYS)
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  giveawayPermlink?: string;

  @ValidateIf((o) => o.type === CAMPAIGN_TYPE.GIVEAWAYS)
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  giveawayPostTitle?: string;

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
  @Max(300)
  @ApiProperty({ type: Number, required: false })
  frequencyAssign: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReservationTimetableDto)
  @ApiProperty({ type: () => ReservationTimetableDto, required: false })
  reservationTimetable: ReservationTimetableDto;

  @IsOptional()
  @MaxLength(256)
  @MinLength(1)
  @IsString()
  @ApiProperty({ type: String, required: false })
  app: string;

  @IsString()
  @ApiProperty({ type: Date, required: true })
  expiredAt: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: Date })
  stoppedAt?: Date;

  @IsOptional()
  @IsString()
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

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    type: Boolean,
    required: false,
    default: true,
  })
  qualifiedPayoutToken: boolean;

  @IsString()
  @IsIn(Object.values(REACH_TYPE))
  @ApiProperty({
    type: String,
    enum: Object.values(REACH_TYPE),
  })
  reach: string;

  @IsOptional()
  @IsString()
  @Validate(IsTimezoneConstraint)
  @ApiProperty({
    type: String,
    required: false,
    description: 'string: E.g., "Europe/Kyiv", "America/New_York"',
  })
  timezone?: string;

  @ValidateIf((o) => o.type === CAMPAIGN_TYPE.GIVEAWAYS_OBJECT)
  @IsNotEmpty()
  @IsString()
  @Validate(IsRRuleConstraint)
  @ApiProperty({
    type: String,
    required: false,
    description: 'RRULE (Recurrence Rule)',
  })
  recurrenceRule?: string;

  @ValidateIf((o) => o.type === CAMPAIGN_TYPE.GIVEAWAYS_OBJECT)
  @IsNumber()
  @Min(1)
  @ApiProperty({ type: Number, required: false })
  durationDays?: number;

  @ValidateIf((o) => o.type === CAMPAIGN_TYPE.GIVEAWAYS_OBJECT)
  @IsNumber()
  @Min(1)
  @ApiProperty({ type: Number, required: false })
  winnersNumber?: number;
}
