import { ApiProperty } from '@nestjs/swagger';

export class GuideMessagesFiltersDto {
  @ApiProperty({ type: [String] })
  conversations: string[];

  @ApiProperty({ type: [String] })
  statuses: string[];
}
