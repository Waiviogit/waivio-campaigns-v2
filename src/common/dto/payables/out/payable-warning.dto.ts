import { ApiProperty } from '@nestjs/swagger';

export class PayableWarningDto {
  @ApiProperty({ type: Boolean })
  warning: boolean;
}
