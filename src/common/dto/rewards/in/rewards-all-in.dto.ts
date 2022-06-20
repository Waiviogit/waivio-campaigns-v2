import { SkipLimitDto } from '../../skip-limit.dto';
import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { numberStingToArray, stringToArray } from '../../../helpers';
import { CAMPAIGN_SORTS } from '../../../constants';

export class RewardsAllInDto extends SkipLimitDto {
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

  @Transform(({ value }) => numberStingToArray(value))
  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [Number],
    required: false,
  })
  area?: number[] = [0, 0];
}
