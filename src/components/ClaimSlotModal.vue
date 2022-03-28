<template>
  <Modal title="Claim Slot" :modalKey="ClaimSlotModalKey">
    <template #content>
      <div class="">Claiming slot "{{ modal.data.slotName }}"</div>
      <div class="flex flex-col space-y-2 w-96 h-24">
        <div class="text-[0.6rem] uppercase tracking-wider font-bold">
          What feature are you deploying there?
        </div>
        <input type="text" v-model="feature" />
      </div>
    </template>

    <template #footer>
      <Button type="secondary" @click="modal.close"> cancel </Button>
      <Button @click="submit" :disabled="!canSubmit">submit</Button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { createModalKey } from './Modal.vue'
interface Data {
  slotId: number | null
  slotName: string
  user: Profile | null
}

export const ClaimSlotModalKey = createModalKey<Data>('claim-slot-modal')
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSlotsApi } from '../api/slots'
import { Profile } from '../api/types'
import Button from './Button.vue'
import Modal, { useModal } from './Modal.vue'

const feature = ref('')

const modal = useModal(ClaimSlotModalKey)

const canSubmit = computed(() => Boolean(feature.value))
const api = useSlotsApi()
async function submit() {
  const { slotId, user } = modal.data ?? {}
  if (!slotId || !user) return
  await api.claim(slotId, {
    userId: user.id,
    feature: feature.value,
  })
  feature.value = ''
  modal.close()
}
</script>
