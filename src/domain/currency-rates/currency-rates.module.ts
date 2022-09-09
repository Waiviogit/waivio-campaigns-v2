import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../persistance/persistence.module';
import { CurrencyRatesHelperProvider } from './currency-rates.provider';

@Module({
  imports: [PersistenceModule],
  providers: [CurrencyRatesHelperProvider],
  exports: [CurrencyRatesHelperProvider],
})
export class CurrencyRatesModule {}
