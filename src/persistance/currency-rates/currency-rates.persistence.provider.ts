import { Provider } from '@nestjs/common';
import { CURRENCY_RATES_PROVIDE } from '../../common/constants';
import { CurrencyRatesRepository } from './currency-rates.repository';

export const CurrencyRatesPersistenceProvider: Provider = {
  provide: CURRENCY_RATES_PROVIDE.REPOSITORY,
  useClass: CurrencyRatesRepository,
};
