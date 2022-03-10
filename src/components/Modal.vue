<template>
  <teleport to=".modal-zone">
    <div
      class="fixed w-screen h-screen md:max-w-lg md:max-h-80 bg-white border flex flex-col rounded-xl"
      v-if="modal.status === 'opened'"
    >
      <div class="flex justify-between px-4 py-2.5 border-b text-lg font-bold">
        Claim Slot
      </div>

      <div class="flex-1 p-4 space-y-4">
        <div class="">Claiming slot "{{ modal.data.slotName }}"</div>
        <div class="flex flex-col space-y-2">
          <div class="text-xs uppercase tracking-wider">
            What feature are you deploying there?
          </div>
          <input type="text" v-model="feature" />
        </div>
      </div>

      <div class="flex space-x-3 px-4 py-2">
        <div class="flex-1"></div>
        <Button type="secondary" @click="modal.close"> cancel </Button>
        <Button @click="submit" :disabled="!canSubmit">submit</Button>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
interface Data {
  slotId: number | null
  slotName: string
  user: Profile | null
}

export const ModalKey = createModalKey<Data>('info-modal')
</script>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useSlotsApi } from '../api/slots'
import { useModal, createModalKey } from './modal'
import { Profile } from '../api/types'
import Button from './Button.vue'

const feature = ref('')

const modal = useModal(ModalKey)

const canSubmit = computed(() => Boolean(feature.value))
const api = useSlotsApi()
function submit() {
  const { slotId, user } = modal.data ?? {}
  if (!slotId || !user) return
  api.claim(slotId, {
    userId: user.id,
    feature: feature.value,
  })
  modal.close()
}
</script>
