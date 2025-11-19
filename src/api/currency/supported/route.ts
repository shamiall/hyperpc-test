import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { currencyService } from '../services/CurrencyService'

/**
 * GET /currency/supported
 * Get list of supported currencies
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const supportedCurrencies = currencyService.getSupportedCurrencies()

    res.status(200).send({
      supported_currencies: supportedCurrencies,
      total_count: supportedCurrencies.length,
      updated_at: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
