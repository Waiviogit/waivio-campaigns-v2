export const SUPPORTED_CURRENCIES = Object.freeze({
  USD: 'USD',
  CAD: 'CAD',
  EUR: 'EUR',
  AUD: 'AUD',
  MXN: 'MXN',
  GBP: 'GBP',
  JPY: 'JPY',
  CNY: 'CNY',
  RUB: 'RUB',
  UAH: 'UAH',
  CHF: 'CHF',
});

export const SUPPORTED_CRYPTO_CURRENCIES = Object.freeze({
  WAIV: 'WAIV',
});

export const DONT_GET_RATES = [
  SUPPORTED_CRYPTO_CURRENCIES.WAIV,
  SUPPORTED_CURRENCIES.USD,
];
