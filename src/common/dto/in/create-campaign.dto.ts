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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CAMPAIGN_TYPE, SUPPORTED_CURRENCY } from '../../constants';

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

export class CreateCampaignDto {
  @IsNotEmpty()
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

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  note: string;

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
  @Max(50000)
  @ApiProperty({ type: Number, required: true })
  rewardInCurrency: number;

  @ValidateNested()
  @Type(() => RequirementsDto)
  @ApiProperty({ type: () => RequirementsDto })
  requirements: RequirementsDto;

  @ValidateNested()
  @Type(() => UserRequirementsDto)
  @ApiProperty({ type: () => UserRequirementsDto })
  userRequirements: UserRequirementsDto;

  @IsString()
  @ApiProperty({ type: String, required: true })
  requiredObject: string;

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

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false })
  countReservationDays: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false })
  frequencyAssign: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  matchBots: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UserRequirementsDto)
  @ApiProperty({ type: () => ReservationTimetableDto, required: false })
  reservationTimetable: ReservationTimetableDto;

  @IsArray()
  @IsString({ each: true })
  @Matches(/\S+/, { each: true })
  @ApiProperty({ type: [String], required: true })
  objects: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  compensationAccount: string;

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

  @IsOptional()
  @MaxLength(256)
  @MinLength(1)
  @IsString()
  @ApiProperty({ type: String, required: false })
  app: string;

  @IsOptional()
  @ApiProperty({ type: Date, required: false })
  expiredAt: Date;

  @IsOptional()
  @IsIn(Object.values(SUPPORTED_CURRENCY))
  @ApiProperty({
    type: String,
    enum: Object.values(SUPPORTED_CURRENCY),
    required: false,
    default: SUPPORTED_CURRENCY.USD,
  })
  currency: string;
}
