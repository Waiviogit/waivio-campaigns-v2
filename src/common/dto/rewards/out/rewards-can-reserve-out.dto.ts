import { ApiProperty } from '@nestjs/swagger';

export class RewardsCanReserveOutDto {
  @ApiProperty({ type: Boolean })
  canReserve: boolean;
}
