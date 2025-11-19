import { MedusaRequest, MedusaResponse } from '@medusajs/framework'

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.status(200).send('pong')
}
