<template>
  <div
    class="modal-zone fixed inset-0 z-50 flex items-center justify-center"
  ></div>

  <div class="flex space-x-1 px-4 bg-indigo-700">
    <div class="flex-1"></div>
    <div class="flex">
      <div
        v-if="profile"
        class="px-4 py-2 rounded-md text-white bg-slate-600 cursor-pointer"
        @click="api.logout"
      >
        logout
      </div>
      <div
        v-else
        class="px-4 py-2 rounded-md text-white bg-cyan-600 cursor-pointer"
        @click="api.login"
      >
        login
      </div>
    </div>

    <ProfileDisplay class="text-white" :profile="profile" />
  </div>
  <div class="">
    <Slots />
  </div>
</template>

<script setup lang="ts">
import { useProfileData, useProfileApi } from './api/profile'
import Slots from './components/Slots.vue'
import ProfileDisplay from './components/ProfileDisplay.vue'

const { profile, loading } = useProfileData()
const api = useProfileApi()
</script>

<style>
.modal-zone:not(:empty) {
  @apply bg-black/60;
}
.modal-zone:empty {
  pointer-events: none;
}
</style>
