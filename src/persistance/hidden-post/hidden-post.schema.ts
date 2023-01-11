import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class HiddenPost {
  @Prop({ type: String, required: true })
  userName: string;

  @Prop({ type: String, required: true })
  postId: string;
}

export const HiddenPostSchema = SchemaFactory.createForClass(HiddenPost);
