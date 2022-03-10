import { computed, InjectionKey, reactive, ref, shallowRef } from 'vue'

interface ModalApi<T> {
  open(data: T): void
  close(): void
}

type Status = 'opened' | 'closed'

export function createModalKey<T>(key: string) {
  return Symbol() as InjectionKey<ModalApi<T>>
}

const modals = ref(new Map())

export function useModal<T = {}>(key: InjectionKey<ModalApi<T>>) {
  if (!modals.value.has(key)) {
    modals.value.set(key, {
      status: 'closed',
      data: null,
    })
  }

  const modal = modals.value.get(key)

  function open(data: T) {
    modal.data = data
    modal.status = 'opened'
    modals.value.set(key, modal)
  }
  function close() {
    modal.data = null
    modal.status = 'closed'
    modals.value.set(key, modal)
  }

  return reactive({
    open,
    close,
    status: computed(() => modals.value.get(key).status as Status),
    data: computed(() => modals.value.get(key).data as T),
  })
}
