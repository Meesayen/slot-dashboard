import { api } from './_api.js'

export default async function handler(request, response) {
  const { data } = await api
    .from('slots')
    .select(
      `
          id,
          name,
          available,
          slotId,
          branch,
          feature,
          claimed_by (
            id,
            username,
            email,
            nickname
          )
        `
    )
    .order('id')
  response.status(200).json(data)
}
