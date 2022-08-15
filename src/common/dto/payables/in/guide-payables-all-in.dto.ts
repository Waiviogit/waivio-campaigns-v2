import { PayablesInDto } from './payables-in.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';
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
}
