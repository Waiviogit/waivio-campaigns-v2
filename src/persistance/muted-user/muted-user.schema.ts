import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class MutedUser {
  @Prop({ type: String, required: true })
  userName: string;
  @Prop({ type: String, required: true })
  mutedBy: string;
  @Prop({ type: [String] })
  mutedForApps: string[];
}

export const MutedUserSchema = SchemaFactory.createForClass(MutedUser);
