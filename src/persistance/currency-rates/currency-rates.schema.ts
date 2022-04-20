import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RatesDocumentType } from './types';
import { SUPPORTED_CURRENCY } from '../../common/constants';

@Schema({ versionKey: false, id: false })
export class Rates {
  @Prop({ type: Number, required: true })
  CAD: number;

  @Prop({ type: Number, required: true })
  EUR: number;

  @Prop({ type: Number, required: true })
  AUD: number;

  @Prop({ type: Number, required: true })
  MXN: number;

  @Prop({ type: Number, required: true })
  GBP: number;

  @Prop({ type: Number, required: true })
  JPY: number;

  @Prop({ type: Number, required: true })
  CNY: number;

  @Prop({ type: Number, required: true })
  RUB: number;

  @Prop({ type: Number, required: true })
  UAH: number;
}

export const RatesSchema = SchemaFactory.createForClass(Rates);

@Schema({ versionKey: false })
export class CurrencyRates {
  @Prop({ type: String, default: SUPPORTED_CURRENCY.USD })
  base: string;

  @Prop({ type: String, required: true, index: true })
  dateString: string;

  @Prop({ type: RatesSchema })
  rates: RatesDocumentType;
}

export const CurrencyRatesSchema = SchemaFactory.createForClass(CurrencyRates);

CurrencyRatesSchema.index({ base: 1, dateString: -1 }, { unique: true });
