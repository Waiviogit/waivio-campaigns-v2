import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateDeactivationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  activationPermlink: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  guideName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  deactivationPermlink: string;
}
