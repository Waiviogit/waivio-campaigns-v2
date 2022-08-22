import { SkipLimitDto } from '../../skip-limit.dto';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { CAMPAIGN_SORTS } from '../../../constants';
import { ApiProperty } from '@nestjs/swagger';

export class GuideReservationsInDto extends SkipLimitDto {
  @IsString()
  @IsIn(Object.values(CAMPAIGN_SORTS))
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    enum: Object.values(CAMPAIGN_SORTS),
  })
  sort?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  campaignNames?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  statuses?: string[];
}
