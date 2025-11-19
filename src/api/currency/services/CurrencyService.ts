import axios, { AxiosResponse } from 'axios'
import { CachedExchangeRates, ExchangeRateApiErrorResponse, ExchangeRateApiResponse, SupportedCurrencies } from '../types'
import { convertQuerySchema } from '../joiScheme/convertQuerySchema'
import { currencyCache } from './RedisService'

/**
 * Currency conversion service
 * Integrates with exchangerate-api.com and provides caching
 */
class CurrencyService {
  private readonly baseUrl = 'https://v6.exchangerate-api.com/v6'
  private readonly apiKey: string
  private readonly timeout = 5000 // 5 seconds timeout

  constructor() {
    // API key from environment variable (free tier available)
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || 'free'
  }

  /**
   * Get exchange rates for a base currency from cache or API
   * @param baseCurrency - Base currency code (e.g., 'USD')
   * @returns Promise with exchange rates object
   */
  private async getExchangeRates(baseCurrency: SupportedCurrencies): Promise<CachedExchangeRates> {
    // Try to get from cache first
    const cachedRates = await currencyCache.get(baseCurrency)
    if (cachedRates) {
      console.log(`[CurrencyService] Using cached rates for ${baseCurrency}`)
      return cachedRates
    }

    console.log(`[CurrencyService] Fetching fresh rates for ${baseCurrency}`)

    try {
      // Construct URL based on API key availability
      const url =
        this.apiKey === 'free'
          ? `${this.baseUrl}/free/latest/${baseCurrency}`
          : `${this.baseUrl}/${this.apiKey}/latest/${baseCurrency}`

      const response: AxiosResponse<ExchangeRateApiResponse | ExchangeRateApiErrorResponse> = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'MedusaJS-Store/1.0'
        }
      })

      // Check if API returned an error
      if ('error-type' in response.data) {
        const errorResponse = response.data as ExchangeRateApiErrorResponse
        throw new Error(`ExchangeRate API Error: ${errorResponse['error-type']}`)
      }

      const apiData = response.data as ExchangeRateApiResponse

      // Validate API response
      if (apiData.result !== 'success') {
        throw new Error(`API returned unsuccessful result: ${apiData.result}`)
      }

      // Create cache entry
      const exchangeRates: CachedExchangeRates = {
        rates: apiData.conversion_rates,
        timestamp: Date.now(),
        baseCurrency: baseCurrency
      }

      // Cache
      await currencyCache.set(baseCurrency, exchangeRates)

      return exchangeRates
    } catch (error) {
      console.error(`[CurrencyService] Error fetching exchange rates:`, error)

      // If no cache available, throw error with fallback rates
      throw new Error(`Unable to fetch exchange rates: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Convert amount from one currency to another
   * @param amount - Amount to convert
   * @param fromCurrency - Source currency code
   * @param toCurrency - Target currency code
   * @returns Promise with conversion result
   */
  async convertCurrency(
    amountToConvert: number,
    fromCurrency: SupportedCurrencies,
    toCurrency: SupportedCurrencies
  ): Promise<{
    convertedAmount: number
    exchangeRate: number
    timestamp: string
    source: 'cache' | 'api' | 'fallback'
  }> {
    // Validate currencies
    const dataValidate = convertQuerySchema.validate({ amount: amountToConvert, from: fromCurrency, to: toCurrency })

    if (dataValidate.error) {
      throw new Error(dataValidate.error && dataValidate.error.message ? dataValidate.error.message : 'validation result is null')
    }

    const { amount, from, to } = dataValidate.value

    // If same currency, return as is
    if (from === to) {
      return {
        convertedAmount: amount,
        exchangeRate: 1,
        timestamp: new Date().toISOString(),
        source: 'cache'
      }
    }

    try {
      // Get exchange rates for the base currency
      const exchangeRates = await this.getExchangeRates(fromCurrency)

      // Get the exchange rate
      const rate = exchangeRates.rates[toCurrency]
      if (!rate) {
        throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`)
      }

      const convertedAmount = amount * rate

      return {
        convertedAmount: convertedAmount, // Round to 2 decimals
        exchangeRate: rate,
        timestamp: new Date(exchangeRates.timestamp).toISOString(),
        source: Date.now() - exchangeRates.timestamp < 60 * 60 * 1000 ? 'cache' : 'api'
      }
    } catch (error) {
      console.error(`[CurrencyService] Conversion error:`, error)

      throw error
    }
  }

  /**
   * Get list of supported currencies
   * @returns Array of supported currency codes
   */
  getSupportedCurrencies(): string[] {
    return [...Object.values(SupportedCurrencies)]
  }
}

// Export singleton instance
export const currencyService = new CurrencyService()
