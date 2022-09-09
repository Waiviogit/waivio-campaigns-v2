import { Document } from 'mongoose';
import { CurrencyRates, Rates } from '../currency-rates.schema';

export type RatesDocumentType = Rates & Document;

export type CurrencyRatesDocumentType = CurrencyRates & Document;
