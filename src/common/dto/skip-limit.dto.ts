import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SkipLimitDto {
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
}
