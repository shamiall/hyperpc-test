import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { CurrencyConversionResponse, CurrencyConversionError } from '../types'
import { convertQuerySchema } from '../joiScheme/convertQuerySchema'
import { currencyService } from '../services/CurrencyService'

/**
 * GET /store/currency/convert
 * Convert amount from one currency to another
 *
 * Query Parameters:
 * - amount: number (positive, up to 1 billion)
 * - from: string (3-letter currency code)
 * - to: string (3-letter currency code)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const startTime = Date.now()

  try {
    // Validate query parameters
    const dataValidate = convertQuerySchema.validate(req.query)

    if (dataValidate.error) {
      throw new Error(dataValidate.error && dataValidate.error.message ? dataValidate.error.message : 'validation result is null')
    }

    const { amount, from, to } = dataValidate.value

    console.log(`[Currency API] Converting ${amount} ${from} to ${to}`)

    // Perform currency conversion
    const conversionResult = await currencyService.convertCurrency(amount, from, to)

    // Construct response
    const response: CurrencyConversionResponse = {
      original: {
        amount,
        currency: from
      },
      converted: {
        amount: conversionResult.convertedAmount,
        currency: to
      },
      exchange_rate: conversionResult.exchangeRate,
      timestamp: conversionResult.timestamp
    }

    // Add performance and cache headers
    const duration = Date.now() - startTime
    res.setHeader('X-Response-Time', `${duration}ms`)
    res.setHeader('X-Cache-Status', conversionResult.source)
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour

    console.log(`[Currency API] Conversion completed in ${duration}ms (source: ${conversionResult.source})`)

    res.json(response)
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[Currency API] Error after ${duration}ms:`, error)

    // Handle service errors
    if (error instanceof Error) {
      // Check if it's a currency support error
      if (error.message.includes('Unsupported')) {
        const errorResponse: CurrencyConversionError = {
          error: error.message,
          supported_currencies: currencyService.getSupportedCurrencies()
        }

        return res.status(400).json(errorResponse)
      }

      // Check if it's an external API error
      if (error.message.includes('Unable to fetch exchange rates')) {
        const errorResponse: CurrencyConversionError = {
          error: 'Currency conversion service temporarily unavailable',
          details: 'Please try again later'
        }

        return res.status(503).json(errorResponse)
      }

      // Generic service error
      const errorResponse: CurrencyConversionError = {
        error: 'Currency conversion failed',
        details: error.message
      }

      return res.status(500).json(errorResponse)
    }

    // Unknown error
    const errorResponse: CurrencyConversionError = {
      error: 'Internal server error'
    }

    res.status(500).json(errorResponse)
  }
}
