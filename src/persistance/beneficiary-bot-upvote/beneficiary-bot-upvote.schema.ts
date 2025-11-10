import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BOT_UPVOTE_STATUS, PAYOUT_TOKEN } from '../../common/constants';

@Schema()
export class BeneficiaryBotUpvote {
  @Prop({ type: String, required: true })
  botName: string;

  @Prop({ type: String, required: true })
  sponsor: string;

  @Prop({ type: String })
  activationPermlink: string;

  @Prop({ type: String, enum: [PAYOUT_TOKEN.WAIV], default: PAYOUT_TOKEN.WAIV })
  symbol?: string;

  @Prop({ type: String, required: true })
  author: string;

  @Prop({ type: String, required: true })
  permlink: string;

  @Prop({ type: Number, default: 0 })
  voteWeight?: number;

  @Prop({ type: Number, required: true })
  reward: number;

  @Prop({ type: Number, default: 0 })
  currentVote?: number;

  @Prop({ type: Number, required: true })
  amountToVote: number;

  @Prop({
    type: String,
    enum: Object.values(BOT_UPVOTE_STATUS),
    required: true,
    default: BOT_UPVOTE_STATUS.PENDING,
  })
  status?: string;

  @Prop({ type: Date, required: true })
  eventDate: Date;

  @Prop({ type: Date, required: true })
  startedAt: Date;

  @Prop({ type: Date, required: true })
  expiredAt: Date;
}

export const BeneficiaryBotUpvoteSchema =
  SchemaFactory.createForClass(BeneficiaryBotUpvote);

BeneficiaryBotUpvoteSchema.index({ activationPermlink: 1, eventDate: 1 });
