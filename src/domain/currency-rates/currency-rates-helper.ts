import { Inject, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import * as moment from 'moment';
import {
  CURRENCY_RATES_PROVIDE,
  DONT_GET_RATES,
  SUPPORTED_CRYPTO_CURRENCIES,
  SUPPORTED_CURRENCIES,
} from '../../common/constants';
import { CurrencyRatesRepositoryInterface } from '../../persistance/currency-rates/interface';
import {
  CurrencyRatesHelperInterface,
  GetCurrencyAmountInterface,
  GetCurrencyRatesInterface,
} from './interface';
import { CurrencyRatesDocumentType } from '../../persistance/currency-rates/types';
import BigNumber from 'bignumber.js';

@Injectable()
export class CurrencyRatesHelper implements CurrencyRatesHelperInterface {
  constructor(
    @Inject(CURRENCY_RATES_PROVIDE.REPOSITORY)
    private readonly currencyRatesRepository: CurrencyRatesRepositoryInterface,
  ) {}

  async getCurrencyRates({
    collection,
    currency,
    pathTimestamp,
    momentCallback,
  }: GetCurrencyRatesInterface): Promise<CurrencyRatesDocumentType[]> {
    if (_.includes(DONT_GET_RATES, currency)) return [];
    let includeToday = false;
    const dates = _.uniq(
      _.map(collection, (record) => {
        if (
          momentCallback(_.get(record, `${pathTimestamp}`)).isSame(
            Date.now(),
            'day',
          )
        ) {
          includeToday = true;
        }

        return momentCallback(_.get(record, `${pathTimestamp}`)).format(
          'YYYY-MM-DD',
        );
      }),
    );

    const result = await this.currencyRatesRepository.find({
      filter: { dateString: { $in: dates }, base: SUPPORTED_CURRENCIES.USD },
      projection: { [`rates.${currency}`]: 1, dateString: 1 },
    });
    if (includeToday) {
      const latest = await this.currencyRatesRepository.findOne({
        filter: { base: SUPPORTED_CURRENCIES.USD },
        projection: { [`rates.${currency}`]: 1 },
        options: { sort: { dateString: -1 } },
      });
      if (latest) {
        latest.dateString = moment().format('YYYY-MM-DD');
        result.push(latest);
      }
    }
    return result;
  }

  getCurrencyAmount({
    history,
    currency,
    rates,
  }: GetCurrencyAmountInterface): number {
    if (!currency) return history.amount;
    if (_.isNil(_.get(history, 'payableInDollars'))) {
      history.payableInDollars = 0;
    }

    const currencyAmount = {
      [SUPPORTED_CRYPTO_CURRENCIES.WAIV]: () => _.get(history, 'amount'),
      [SUPPORTED_CURRENCIES.USD]: () => _.get(history, 'payableInDollars'),
      getAmount: () => this.getAmountFromRate({ rates, history, currency }),
    };
    return (currencyAmount[currency] || currencyAmount.getAmount)();
  }

  getAmountFromRate = ({ rates, history, currency }): number => {
    const rate = _.find(rates, (el) =>
      moment(el.dateString).isSame(moment(history.createdAt), 'day'),
    );

    return new BigNumber(_.get(history, 'payableInDollars'))
      .times(_.get(rate, `rates.${currency}`))
      .toNumber();
  };
}
