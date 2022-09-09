import { Provider } from '@nestjs/common';
import { CURRENCY_RATES_PROVIDE } from '../../common/constants';

import { CurrencyRatesHelper } from './currency-rates-helper';

export const CurrencyRatesHelperProvider: Provider = {
  provide: CURRENCY_RATES_PROVIDE.HELPER,
  useClass: CurrencyRatesHelper,
};
