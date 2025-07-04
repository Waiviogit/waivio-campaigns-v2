import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class GiveawayParticipants {
  @Prop({ type: String, required: true, index: true })
  activationPermlink: string;

  @Prop({ type: String, required: true, index: true })
  userName: string;
}

export const GiveawayParticipantsSchema =
  SchemaFactory.createForClass(GiveawayParticipants);
