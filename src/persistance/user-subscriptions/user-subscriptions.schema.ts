import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class UserSubscriptions {
  @Prop({ type: String, required: true })
  follower: string;

  @Prop({ type: String, required: true })
  following: string;

  @Prop({ type: Boolean })
  bell: string;
}

export const UserSubscriptionsSchema =
  SchemaFactory.createForClass(UserSubscriptions);


UserSubscriptionsSchema.index({ follower: 1, following: 1 }, { unique: true });
UserSubscriptionsSchema.index({ following: 1 });
