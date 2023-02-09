import { ApiProperty } from '@nestjs/swagger';

export class RewardSponsorsDto {
  @ApiProperty({ type: [String] })
  type: string[];

  @ApiProperty({ type: [String] })
  sponsors: string[];

  @ApiProperty({ type: [String] })
  reach: string[];
}
