import Joi from 'joi'
import { CurrencyConversionRequest, SupportedCurrencies } from '../types'

export const convertQuerySchema = Joi.object<CurrencyConversionRequest>({
  amount: Joi.number().min(0.01).max(1_000_000_000).required(),
  from: Joi.string()
    .length(3)
    .uppercase()
    .valid(...Object.values(SupportedCurrencies))
    .required(),
  to: Joi.string()
    .length(3)
    .uppercase()
    .valid(...Object.values(SupportedCurrencies))
    .required()
}).required()
