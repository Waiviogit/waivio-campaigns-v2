import { mappedSponsorType } from '../../../../domain/sponsors-bot/type';
import { ApiProperty } from '@nestjs/swagger';

class MappedSponsorDto {
  @ApiProperty({ type: String })
  botName: string;

  @ApiProperty({ type: Number })
  minVotingPower: number;

  @ApiProperty({ type: String })
  sponsor: string;

  @ApiProperty({ type: String })
  note: string;

  @ApiProperty({ type: Boolean })
  enabled: boolean;

  @ApiProperty({ type: Number })
  votingPercent: number;

  @ApiProperty({ type: String })
  expiredAt: Date;
}

export class SponsorsBotOutDto {
  @ApiProperty({ type: [MappedSponsorDto] })
  results: mappedSponsorType[];

  @ApiProperty({ type: Number })
  minVotingPower: number;

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
}
