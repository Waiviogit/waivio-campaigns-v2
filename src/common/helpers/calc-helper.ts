import * as _ from 'lodash';
import BigNumber from 'bignumber.js';

interface SumByInterface {
  arr: [];
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function;
  dp?: number;
}

export const sumBy = ({ arr, callback, dp = 3 }: SumByInterface): number =>
  _.reduce(
    arr,
    (value, element) => new BigNumber(value).plus(callback(element)),
    new BigNumber(0),
  )
    .dp(dp)
    .toNumber();
