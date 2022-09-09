import { CurrencyRatesDocumentType } from '../../../persistance/currency-rates/types';

export interface CurrencyRatesHelperInterface {
  getCurrencyRates(
    params: GetCurrencyRatesInterface,
  ): Promise<CurrencyRatesDocumentType[]>;

  getCurrencyAmount(params: GetCurrencyAmountInterface): number;
}

export interface GetCurrencyRatesInterface {
  collection: object[];
  currency: string;
  pathTimestamp: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  momentCallback: Function;
}
type HistoryRecord = {
  amount: number;
  payableInDollars: number;
};

export interface GetCurrencyAmountInterface {
  history: HistoryRecord;
  currency: string;
  rates: object[];
}
