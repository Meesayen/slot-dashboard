<template>
  <div class="h-96 w-screen flex items-center justify-center" v-if="loading">
    loading...
  </div>
  <div class="grid grid-cols-4 gap-6 p-8" v-else>
    <SlotCard v-for="slot of slots" :key="slot.id" :slot="slot" />
  </div>

  <Modal ref="modal" />
</template>

<script lang="ts">
export const ModalApi = Symbol() as InjectionKey<
  Ref<InstanceType<typeof Modal>>
>
</script>

<script lang="ts" setup>
import { useSlotsData } from '../api/slots'
import SlotCard from './SlotCard.vue'
import Modal from './Modal.vue'
import { InjectionKey, provide, Ref, ref } from 'vue'

const { slots, loading } = useSlotsData()

const modal = ref<InstanceType<typeof Modal> | null>(null)

provide(ModalApi, modal)
</script>
