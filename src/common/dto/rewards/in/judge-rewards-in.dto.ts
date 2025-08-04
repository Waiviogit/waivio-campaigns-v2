import { SkipLimitDto } from '../../skip-limit.dto';
import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { stringToArray } from '../../../helpers';
import { CAMPAIGN_SORTS, REACH_TYPE } from '../../../constants';

export class JudgeRewardsInDto extends SkipLimitDto {
  @Transform(({ value }) => stringToArray(value))
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  sponsors?: string[];

  @Transform(({ value }) => stringToArray(value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({ type: [String], required: false })
  type?: string[];

  @IsString()
  @IsIn(Object.values(CAMPAIGN_SORTS))
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    enum: Object.values(CAMPAIGN_SORTS),
  })
  sort?: string;

  @IsString()
  @IsOptional()
  @IsIn(Object.values(REACH_TYPE))
  @ApiProperty({
    type: String,
    enum: Object.values(REACH_TYPE),
    required: false,
  })
  reach?: string;
}

export class JudgeRewardsByObjectInDto extends JudgeRewardsInDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  userName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  requiredObject?: string;
}

export class JudgeSponsorsInDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  requiredObject?: string;

  @IsString()
  @IsOptional()
  @IsIn(Object.values(REACH_TYPE))
  @ApiProperty({
    type: String,
    enum: Object.values(REACH_TYPE),
    required: false,
  })
  reach?: string;
}
