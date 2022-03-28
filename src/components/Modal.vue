<template>
  <teleport to=".modal-zone">
    <div
      class="fixed md:max-w-lg md:max-h-[70vh] bg-white border flex flex-col rounded-xl"
      v-if="modal.status === 'opened'"
    >
      <div class="flex justify-between px-4 py-2.5 border-b text-lg font-bold">
        {{ title }}
      </div>

      <div class="flex-1 p-4 space-y-4">
        <slot name="content" />
      </div>

      <div class="flex space-x-3 px-4 py-2">
        <div class="flex-1"></div>
        <slot name="footer" />
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
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

export function closeAllModals() {
  for (const key of modals.value.keys()) {
    const modal = modals.value.get(key)
    modal.data = null
    modal.status = 'closed'
    modals.value.set(key, modal)
  }
}
</script>

<script setup lang="ts">
const props = defineProps<{
  title: string
  modalKey: InjectionKey<{}>
}>()

const modal = useModal(props.modalKey)
</script>
