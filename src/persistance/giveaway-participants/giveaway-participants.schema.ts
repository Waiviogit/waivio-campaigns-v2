import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class GiveawayParticipants {
  @Prop({ type: String, required: true })
  activationPermlink: string;

  @Prop({ type: String, required: true })
  userName: string;

  @Prop({ type: String, required: false })
  eventId?: string;
}

export const GiveawayParticipantsSchema =
  SchemaFactory.createForClass(GiveawayParticipants);

GiveawayParticipantsSchema.index(
  { activationPermlink: 1, userName: 1 },
  { unique: true },
);
