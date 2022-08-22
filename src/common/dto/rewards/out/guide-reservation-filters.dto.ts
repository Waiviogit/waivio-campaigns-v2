import { ApiProperty } from '@nestjs/swagger';

export class GuideReservationFiltersDto {
  @ApiProperty({ type: [String] })
  campaignNames: string[];

  @ApiProperty({ type: [String] })
  statuses: string[];
}
