import Redis from 'ioredis'
import { CachedExchangeRates, SupportedCurrencies } from '../types'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

class CurrencyCache {
  private readonly _KEY_PATTERN_PREFIX = 'cache:currency'
  private readonly _GET_TOKENS_CACHE_KEY = (currency: SupportedCurrencies) => `${this._KEY_PATTERN_PREFIX}:${currency}`
  private readonly _DEFAULT_TTL = 3600 // 1 hour

  set(currency: SupportedCurrencies, exchangeRates: CachedExchangeRates, ttl: number = this._DEFAULT_TTL): Promise<'OK'> {
    const key = this._GET_TOKENS_CACHE_KEY(currency)
    return redis.setex(key, ttl, JSON.stringify(exchangeRates))
  }

  async get(currency: SupportedCurrencies): Promise<CachedExchangeRates | null> {
    const key = this._GET_TOKENS_CACHE_KEY(currency)
    const exchangeRatesString = await redis.get(key)
    return exchangeRatesString ? JSON.parse(exchangeRatesString) : null
  }
}

export const currencyCache = new CurrencyCache()
