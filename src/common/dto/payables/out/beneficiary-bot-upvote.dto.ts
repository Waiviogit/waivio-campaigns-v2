import { ApiProperty } from '@nestjs/swagger';
import { BOT_UPVOTE_STATUS } from '../../../constants';

export class BeneficiaryBotUpvoteDto {
  @ApiProperty({ type: String })
  _id: string;

  @ApiProperty({ type: String })
  botName: string;

  @ApiProperty({
    type: String,
    enum: Object.values(BOT_UPVOTE_STATUS),
  })
  status: string;

  @ApiProperty({ type: Number, required: false })
  voteWeight?: number;

  @ApiProperty({ type: Number, required: false })
  tokenAmount?: number;

  @ApiProperty({ type: Number, required: false })
  usdAmount?: number;
}
