import { ApiProperty } from '@nestjs/swagger';
import { BOT_UPVOTE_STATUS, PAYOUT_TOKEN } from '../../../constants';

export class BeneficiaryBotUpvoteDto {
  @ApiProperty({ type: String })
  _id: string;

  @ApiProperty({ type: String })
  botName: string;

  @ApiProperty({ type: String })
  sponsor: string;

  @ApiProperty({ type: String, required: false })
  activationPermlink?: string;

  @ApiProperty({ type: String, enum: [PAYOUT_TOKEN.WAIV], required: false })
  symbol?: string;

  @ApiProperty({ type: String })
  author: string;

  @ApiProperty({ type: String })
  permlink: string;

  @ApiProperty({ type: Number, required: false })
  voteWeight?: number;

  @ApiProperty({ type: Number })
  reward: number;

  @ApiProperty({ type: Number, required: false })
  currentVote?: number;

  @ApiProperty({ type: Number })
  amountToVote: number;

  @ApiProperty({
    type: String,
    enum: Object.values(BOT_UPVOTE_STATUS),
    required: false,
  })
  status?: string;

  @ApiProperty({ type: Date })
  eventDate: Date;

  @ApiProperty({ type: Date })
  startedAt: Date;

  @ApiProperty({ type: Date })
  expiredAt: Date;
}
