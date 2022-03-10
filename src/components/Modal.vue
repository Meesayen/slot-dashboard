<template>
  <teleport to=".modal-zone">
    <div
      class="fixed w-screen h-screen md:max-w-lg md:max-h-80 bg-white border flex flex-col rounded-xl"
      v-if="isOpened"
    >
      <div class="flex justify-between px-4 py-2.5 border-b text-lg font-bold">
        Claim Slot
      </div>

      <div class="flex-1 p-4 space-y-4">
        <div class="">Claiming slot "{{ data.slotName }}"</div>
        <div class="flex flex-col space-y-2">
          <div class="text-xs uppercase tracking-wider">
            What feature are you deploying there?
          </div>
          <input type="text" v-model="data.feature" />
        </div>
      </div>

      <div class="flex space-x-3 px-4 py-2">
        <div class="flex-1"></div>
        <Button type="secondary" @click="close">cancel</Button>
        <Button @click="submit">submit</Button>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useSlotsApi } from '../api/slots'
import { Profile } from '../api/types'
import Button from './Button.vue'

interface Data {
  slotId: number | null
  slotName: string
  user: Profile | null
}

const data: Data & {
  feature: string
} = reactive({
  slotId: null,
  slotName: '',
  user: null,
  feature: '',
})

const isOpened = ref(false)

function open(inputData: Data) {
  data.slotId = inputData.slotId
  data.slotName = inputData.slotName
  data.user = inputData.user
  isOpened.value = true
}
function close() {
  isOpened.value = false
  data.slotId = null
  data.slotName = ''
  data.user = null
  data.feature = ''
}

defineExpose({
  open,
  close,
})

const canSubmit = computed(() => Boolean(data.feature))
const api = useSlotsApi()
function submit() {
  if (!data.slotId || !data.user) return
  api.claim(data.slotId, {
    userId: data.user.id,
    feature: data.feature,
  })
  close()
}
</script>
