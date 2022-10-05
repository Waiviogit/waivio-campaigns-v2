import { ApiProperty } from '@nestjs/swagger';

export class RewardsCanReserveOutDto {
  @ApiProperty({ type: Boolean })
  canAssignByBudget: boolean;

  @ApiProperty({ type: Boolean })
  canAssignByCurrentDay: boolean;

  @ApiProperty({ type: Boolean })
  posts: boolean;

  @ApiProperty({ type: Boolean })
  followers: boolean;

  @ApiProperty({ type: Boolean })
  expertise: boolean;

  @ApiProperty({ type: Boolean })
  notAssigned: boolean;

  @ApiProperty({ type: Boolean })
  frequency: boolean;

  @ApiProperty({ type: Boolean })
  notBlacklisted: boolean;

  @ApiProperty({ type: Boolean })
  notGuide: boolean;
}
