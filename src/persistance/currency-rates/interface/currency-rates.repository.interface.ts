import { CurrencyRatesDocumentType } from '../types';
import { MongoRepositoryInterface } from '../../mongo.repository';

export type CurrencyRatesRepositoryInterface =
  MongoRepositoryInterface<CurrencyRatesDocumentType>;
