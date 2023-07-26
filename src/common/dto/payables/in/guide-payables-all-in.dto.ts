import { PayablesInDto } from './payables-in.dto';
import { IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GuidePayablesAllInDto extends PayablesInDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  @ApiProperty({ type: Number, required: false })
  days?: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  @ApiProperty({ type: Number, required: false })
  payable?: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: Number, required: false, default: 0 })
  skip?: number = 0;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: Number, required: false, default: 10 })
  limit?: number = 10;

  @IsString()
  @IsEnum(['amount', 'time'])
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    default: 'amount',
    enum: ['amount', 'time'],
  })
  sort?: string = 'amount';
}
