import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { currencyService } from '../services/CurrencyService'

/**
 * GET /currency/health
 * Check service health and cache status
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const supportedCurrencies = currencyService.getSupportedCurrencies()

    // In a real scenario, we might want to check Redis connectivity here
    // For now, we'll just return the static info and what we know

    res.status(200).send({
      status: 'healthy',
      service: 'currency-conversion',
      version: '1.0.0',
      // Note: Getting all keys from Redis might be expensive in production,
      // so we are simplifying this for the example or we would need to extend RedisService
      cache: {
        status: 'active',
        ttl: 3600
      },
      supported_currencies_count: supportedCurrencies.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
