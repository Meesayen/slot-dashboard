<template>
  <div
    class="flex flex-col rounded-lg overflow-hidden bg-white border-2 border-indigo-400 shadow-md space-y-2 h-48"
  >
    <div
      class="text-xl flex justify-between border-b border-zinc-200 p-3"
      :class="[slot.available ? 'bg-emerald-50' : 'bg-rose-50']"
    >
      <span class="text-teal-600">
        {{ slot.name }}
      </span>
      <div class="flex space-x-2 items-center">
        <div
          class="h-2.5 w-2.5 rounded-full"
          :class="[slot.available ? 'bg-emerald-400' : 'bg-rose-700']"
        ></div>
        <div class="text-xs uppercase tracking-wider">
          {{ slot.available ? 'available' : 'taken' }}
        </div>
      </div>
    </div>

    <div class="px-3" v-if="slot.claimed_by">
      <span class="text-zinc-500 uppercase text-xs tracking-wider">
        Feature:
      </span>
      <span class="text-sm">
        {{ slot.feature }}
      </span>
    </div>

    <div class="flex-1"></div>

    <div class="flex p-3">
      <ProfileDisplay v-if="slot.claimed_by" :profile="slot.claimed_by" />
      <template v-if="profile">
        <div class="flex-1"></div>
        <Button v-if="!slot.claimed_by" @click="openModal"> claim </Button>
        <Button
          v-else-if="slot.claimed_by.id === profile?.id"
          type="secondary"
          @click="api.free(slot.id)"
        >
          free
        </Button>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useProfileData } from '../api/profile'
import { useSlotsApi } from '../api/slots'
import { Slot } from '../api/types'
import ProfileDisplay from './ProfileDisplay.vue'
import Button from './Button.vue'
import { useModal } from './Modal.vue'
import { ClaimSlotModalKey } from './ClaimSlotModal.vue'

const props = defineProps<{
  slot: Slot
}>()

const api = useSlotsApi()
const { profile } = useProfileData()

const modal = useModal(ClaimSlotModalKey)

function openModal() {
  modal.open({
    slotId: props.slot.id,
    slotName: props.slot.name,
    user: profile.value!,
  })
}
</script>
