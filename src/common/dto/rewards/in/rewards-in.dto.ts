/* eslint-disable @typescript-eslint/no-inferrable-types */
import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RewardsInDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: Number, default: 0, required: false })
  skip: number = 0;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: Number, default: 10, required: false })
  limit: number = 10;
}
