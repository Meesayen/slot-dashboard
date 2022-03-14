import type { VercelRequest, VercelResponse } from '@vercel/node'
import { api } from './_api'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { data } = await api.from('slots').select()
  response.status(200).json(data)
}
