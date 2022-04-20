import { FilterQuery, QueryOptions } from 'mongoose';

import { CurrencyRatesDocumentType } from './currency-rates.types';

export type CurrencyRatesFindType = {
  filter: FilterQuery<CurrencyRatesDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
};
