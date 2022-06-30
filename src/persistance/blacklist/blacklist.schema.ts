import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Blacklist {
  @Prop({
    type: String,
    required: true,
    index: true,
    unique: true,
  })
  user: string;

  @Prop({ type: [String], default: [] })
  whiteList: string[];

  @Prop({ type: [String], default: [] })
  blackList: string[];

  @Prop({ type: [String], default: [] })
  followLists: string[];
}

export const BlacklistSchema = SchemaFactory.createForClass(Blacklist);
