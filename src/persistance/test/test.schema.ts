import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
class Test {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop()
  name: string;
  @Prop()
  email: string;
}

export const testSchema = SchemaFactory.createForClass(Test);

export type campaignDocument = Test & Document;
