import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EligibleSponsorsDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  userName: string;
}
