import { api } from '../../_api.js'

export default async function handler(request, response) {
  const slotId = request.query.slot

  const { email, username } = request.body ?? {}
  if (!email && !username) {
    response
      .status(400)
      .send(
        'Missing parameter. Please provide the following: `email` or `username`'
      )
    return
  }

  const { data: user } = await api
    .from('profiles')
    .select()
    .or(`email.eq.${email},username.eq.${username}`)
    .limit(1)
    .single()

  if (!user) {
    response.status(403).send('User not recognized.')
    return
  }

  try {
    const { error } = await api
      .from('slots')
      .update({
        claimed_by: null,
        feature: null,
        branch: null,
        available: true,
      })
      .match({ slotId: slotId })

    if (error) {
      throw error
    }
    response.status(200).send('Done.')
  } catch (error) {
    response.status(500).json(error)
  }
}
