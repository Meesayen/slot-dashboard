import type { VercelRequest, VercelResponse } from '@vercel/node'
import { api } from './_api'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { email } = request.body ?? {}
  if (!email) {
    response.status(400).send('Missing email parameter.')
    return
  }
  const slots = await api.from('slots').select()
  const profile = await api.from('profiles').select().eq('email', email)

  if (!profile) {
    response.status(403).send('User not recognized.')
    return
  }

  response.status(200).json(profile)
}
