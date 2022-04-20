import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION, CONNECTION_MONGO } from '../../common/constants';
import { CurrencyRates, CurrencyRatesSchema } from './currency-rates.schema';
import { CurrencyRatesPersistenceProvider } from './currency-rates.persistence.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: CurrencyRates.name,
          schema: CurrencyRatesSchema,
          collection: COLLECTION.CURRENCY_RATES,
        },
      ],
      CONNECTION_MONGO.CURRENCIES,
    ),
  ],
  providers: [CurrencyRatesPersistenceProvider],
  exports: [CurrencyRatesPersistenceProvider],
})
export class CurrencyRatesPersistenceModule {}
