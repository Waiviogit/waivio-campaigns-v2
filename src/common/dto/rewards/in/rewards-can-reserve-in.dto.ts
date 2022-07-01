import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RewardsCanReserveInDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  userName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  activationPermlink: string;
}
