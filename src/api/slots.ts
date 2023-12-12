import { ref, watchEffect } from 'vue'
import { api } from './core'
import { Slot } from './types'

export function useSlotsData() {
  const slots = ref<Slot[]>([])
  const loading = ref(true)

  function fetch() {
    return api
      .from('slots')
      .select(
        `
          id,
          name,
          available,
          feature,
          updated_at,
          is_preprod,
          order,
          claimed_by (
            id,
            username,
            avatar_url,
            nickname
          )
        `
      )
      .order('order')
  }

  watchEffect(async () => {
    const res = await fetch()

    api
      .from('slots')
      .on('UPDATE', async () => {
        const res = await fetch()
        slots.value = res.data as Slot[]
      })
      .subscribe()

    slots.value = res.data as Slot[]
    loading.value = false

    if (res.error) {
      console.log(res.error)
    }
  })

  return { slots, loading }
}

export function useSlotsApi() {
  async function claim(
    id: number,
    params: {
      userId: string
      feature: string
    }
  ) {
    await api
      .from('slots')
      .update({
        claimed_by: params.userId,
        feature: params.feature,
        available: false,
      })
      .match({ id })
  }

  async function free(id: number) {
    await api
      .from('slots')
      .update({ claimed_by: null, feature: null, available: true })
      .match({ id })
  }

  return {
    claim,
    free,
  }
}
