import { CurrencyRatesDocumentType, CurrencyRatesFindType } from '../types';

export interface CurrencyRatesRepositoryInterface {
  findOne({
    filter,
    projection,
    options,
  }: CurrencyRatesFindType): Promise<CurrencyRatesDocumentType>;

  find({
    filter,
    projection,
    options,
  }: CurrencyRatesFindType): Promise<CurrencyRatesDocumentType[]>;
}
