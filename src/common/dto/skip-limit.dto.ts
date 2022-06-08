import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SkipLimitDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: Number })
  skip?: number = 0;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: Number })
  limit?: number = 10;
}
