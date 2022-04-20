import { Document } from 'mongoose';
import { Rates } from '../currency-rates.schema';

export type RatesDocumentType = Rates & Document;

export type CurrencyRatesDocumentType = Rates & Document;
