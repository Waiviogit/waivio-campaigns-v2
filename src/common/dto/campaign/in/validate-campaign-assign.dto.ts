import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCampaignAssignDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  activationPermlink: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  requiredObject: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  reservationPermlink: string;
}
