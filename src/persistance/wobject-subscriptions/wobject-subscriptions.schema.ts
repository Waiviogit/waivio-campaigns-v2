import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class WobjectSubscriptions {
  @Prop({ type: String, required: true })
  follower: string;

  @Prop({ type: String, required: true })
  following: string;

  @Prop({ type: Boolean })
  bell: string;
}

export const WobjectSubscriptionsSchema =
  SchemaFactory.createForClass(WobjectSubscriptions);

WobjectSubscriptionsSchema.index(
  { follower: 1, following: 1 },
  { unique: true },
);
WobjectSubscriptionsSchema.index({ following: 1 });
