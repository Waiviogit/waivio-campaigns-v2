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
  IsEnum,
} from 'class-validator';
import { SupportedCurrencies } from '../../../../common/enum';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  id: string;

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
  @ApiProperty({ type: String, required: false })
  description: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  type: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  note: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false })
  budget: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false })
  reward: number;

  @ValidateNested()
  @Type(() => RequirementsDto)
  @ApiProperty({ type: () => RequirementsDto })
  requirements: RequirementsDto;

  @ValidateNested()
  @Type(() => UserRequirementsDto)
  @ApiProperty({ type: () => UserRequirementsDto })
  userRequirements: UserRequirementsDto;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
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

  @IsNumber()
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
  @IsEnum(SupportedCurrencies)
  @ApiProperty({ type: String, enum: SupportedCurrencies, required: false })
  currency: SupportedCurrencies;
}
