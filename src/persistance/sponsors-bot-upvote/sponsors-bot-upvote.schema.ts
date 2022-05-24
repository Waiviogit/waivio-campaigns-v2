import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BOT_UPVOTE_STATUS } from '../../common/constants';

@Schema()
export class SponsorsBotUpvote {
  @Prop({ type: String, required: true })
  botName: string;

  @Prop({ type: String, required: true })
  sponsor: string;

  @Prop({ type: String, required: true })
  author: string;

  @Prop({ type: Number, default: 0 })
  votePercent?: number;

  @Prop({ type: String, required: true })
  permlink: string;

  @Prop({ type: Number, required: true })
  reward: number;

  @Prop({ type: Number, default: 0 })
  currentVote?: number;

  @Prop({ type: Number, required: true })
  amountToVote: number;

  @Prop({ type: Boolean, default: false })
  executed?: boolean;

  @Prop({ type: Number, default: 0 })
  totalVotesWeight?: number;

  @Prop({ type: String, required: true })
  requiredObject: string;

  @Prop({ type: String, required: true })
  reservationPermlink: string;

  @Prop({ type: String })
  compensationId?: string;

  @Prop({
    type: String,
    enum: Object.values(BOT_UPVOTE_STATUS),
    required: true,
    default: BOT_UPVOTE_STATUS.PENDING,
  })
  status: string;

  @Prop({ type: Date, required: true })
  startedAt: Date;

  @Prop({ type: Date, required: true })
  expiredAt: Date;
}

export const SponsorsBotUpvoteSchema =
  SchemaFactory.createForClass(SponsorsBotUpvote);
