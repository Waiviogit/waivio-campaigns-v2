import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCampaignRejectDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  activationPermlink: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  reservationPermlink: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  rejectionPermlink: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  name: string;
}
