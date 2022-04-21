import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidationResponseDto {
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  isValid: boolean;
}
