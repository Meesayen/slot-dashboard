import type { VercelRequest, VercelResponse } from '@vercel/node'
import { api } from '../_api'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const slotId = request.query.slot

  const { email, feature } = request.body ?? {}
  if (!email || !feature) {
    response
      .status(400)
      .send('Missing parameter. Please provide the following: email, feature')
    return
  }

  const { data } = await api.from('profiles').select().eq('email', email)

  if (!data[0]) {
    response.status(403).json(data)
    return
  }

  try {
    await api
      .from('slots')
      .update({
        claimed_by: data[0].id,
        feature: feature,
        available: false,
      })
      .match({ id: slotId })

    response.status(200).send('Done.')
  } catch (error) {
    response.status(500).json(error)
  }
}
