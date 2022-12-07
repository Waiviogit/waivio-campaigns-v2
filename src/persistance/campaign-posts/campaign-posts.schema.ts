import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class CampaignPost {
  @Prop({ type: String, required: true })
  author: string;

  @Prop({ type: String, required: true })
  permlink: string;

  @Prop({ type: Number })
  rewardInToken: number;

  @Prop({ type: Number })
  payoutTokenRateUSD: number;

  @Prop({ type: String })
  symbol: string;

  @Prop({ type: String })
  guideName: string;
}

export const CampaignPostsSchema = SchemaFactory.createForClass(CampaignPost);

CampaignPostsSchema.index({ author: 1, permlink: 1 }, { unique: true });
