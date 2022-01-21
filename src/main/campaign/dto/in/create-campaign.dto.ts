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

class ReservationTimetableDto {
  @IsOptional()
  @IsBoolean()
  monday: boolean;

  @IsOptional()
  @IsBoolean()
  tuesday: boolean;

  @IsOptional()
  @IsBoolean()
  wednesday: boolean;

  @IsOptional()
  @IsBoolean()
  thursday: boolean;

  @IsOptional()
  @IsBoolean()
  friday: boolean;

  @IsOptional()
  @IsBoolean()
  saturday: boolean;

  @IsOptional()
  @IsBoolean()
  sunday: boolean;
}

class RequirementsDto {
  @IsNumber()
  minPhotos: number;

  @IsOptional()
  @IsBoolean()
  receiptPhoto: boolean;
}

class UserRequirementsDto {
  @IsNumber()
  minPosts: number;

  @IsNumber()
  minFollowers: number;

  @IsNumber()
  minExpertise: number;
}

export class CreateCampaignDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  guideName: string;

  @IsNotEmpty()
  @MaxLength(256)
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsNumber()
  budget: number;

  @IsOptional()
  @IsNumber()
  reward: number;

  @ValidateNested()
  @Type(() => RequirementsDto)
  requirements: RequirementsDto;

  @ValidateNested()
  @Type(() => UserRequirementsDto)
  userRequirements: UserRequirementsDto;

  @IsOptional()
  @IsString()
  requiredObject: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blacklistUsers: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whitelistUsers: string[];

  @IsOptional()
  @IsNumber()
  countReservationDays: number;

  @IsOptional()
  @IsNumber()
  frequencyAssign: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  matchBots: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UserRequirementsDto)
  reservationTimetable: ReservationTimetableDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objects: string[];

  @IsOptional()
  @IsString()
  compensationAccount: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  agreementObjects: string[];

  @IsOptional()
  @IsString()
  usersLegalNotice: string;

  @IsNumber()
  commissionAgreement: number;

  @IsOptional()
  @MaxLength(256)
  @MinLength(1)
  @IsString()
  app: string;

  @IsOptional()
  expiredAt: Date;

  @IsOptional()
  @IsEnum(SupportedCurrencies)
  currency: SupportedCurrencies;
}
