import { ApiProperty } from '@nestjs/swagger';

export class RewardsTabDto {
  @ApiProperty({ type: String })
  tabType: string;
}
