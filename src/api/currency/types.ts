// Currency conversion types
export interface CurrencyConversionRequest {
  amount: number
  from: SupportedCurrencies
  to: SupportedCurrencies
}

export interface CurrencyConversionResponse {
  original: {
    amount: number
    currency: string
  }
  converted: {
    amount: number
    currency: string
  }
  exchange_rate: number
  timestamp: string
}

// External API types
export interface ExchangeRateApiResponse {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_last_update_utc: string
  time_next_update_unix: number
  time_next_update_utc: string
  base_code: string
  conversion_rates: Record<string, number>
}

export interface ExchangeRateApiErrorResponse {
  result: string
  'error-type': string
}

// Cache types
export interface CachedExchangeRates {
  rates: Record<string, number>
  timestamp: number
  baseCurrency: string
}

export interface CacheEntry<T> {
  data: T
  expiresAt: number
}

// Error types
export interface CurrencyConversionError {
  error: string
  details?: string
  supported_currencies?: string[]
}

export enum SupportedCurrencies {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  AUD = 'AUD',
  CAD = 'CAD',
  CHF = 'CHF',
  CNY = 'CNY',
  SEK = 'SEK',
  NZD = 'NZD',
  MXN = 'MXN',
  SGD = 'SGD',
  HKD = 'HKD',
  NOK = 'NOK',
  TRY = 'TRY',
  RUB = 'RUB',
  INR = 'INR',
  BRL = 'BRL',
  ZAR = 'ZAR',
  KRW = 'KRW',
  PLN = 'PLN',
  CZK = 'CZK',
  HUF = 'HUF',
  RON = 'RON',
  BGN = 'BGN',
  HRK = 'HRK',
  DKK = 'DKK',
  ISK = 'ISK',
  THB = 'THB',
  MYR = 'MYR',
  PHP = 'PHP',
  IDR = 'IDR',
  AED = 'AED',
  SAR = 'SAR',
  EGP = 'EGP',
  ILS = 'ILS',
  CLP = 'CLP',
  PEN = 'PEN',
  COP = 'COP',
  ARS = 'ARS'
}
