import { ApiProperty } from '@nestjs/swagger';

export class InBlacklistOutDto {
  @ApiProperty({ type: Boolean })
  inBlacklist: boolean;
}
