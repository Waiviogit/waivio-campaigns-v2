import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RewardsUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  userName: string;
}
