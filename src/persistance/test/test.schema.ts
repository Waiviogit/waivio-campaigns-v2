import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Test {
  @Transform(({ value }) => value.toString())
  _id: string;
  @Prop()
  name: string;
}

export const TestSchema = SchemaFactory.createForClass(Test);

export type TestDocument = Test & Document;
