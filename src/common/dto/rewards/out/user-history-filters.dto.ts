import { ApiProperty } from '@nestjs/swagger';

export class UserHistoryFiltersDto {
  @ApiProperty({ type: [String] })
  guideNames: string[];

  @ApiProperty({ type: [String] })
  statuses: string[];
}
