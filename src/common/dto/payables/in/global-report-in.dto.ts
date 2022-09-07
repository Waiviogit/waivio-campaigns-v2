import { SkipLimitDto } from '../../skip-limit.dto';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PAYOUT_TOKEN } from '../../../constants';

export class GlobalReportInDto extends SkipLimitDto {
  @ApiProperty({ type: String })
  @IsString()
  guideName: string;

  @ApiProperty({
    type: String,
    enum: Object.values(PAYOUT_TOKEN),
    required: false,
  })
  @IsOptional()
  @IsString()
  payoutToken: string = PAYOUT_TOKEN.WAIV;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  currency: string = PAYOUT_TOKEN.WAIV;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objects?: string[];

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  processingFees?: boolean;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  payable?: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @Min(0)
  @Max(9999999999)
  @IsOptional()
  startDate?: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @Min(0)
  @Max(9999999999)
  @IsOptional()
  endDate?: number;
}
