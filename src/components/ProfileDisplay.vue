<template>
  <div class="flex space-x-2 items-center">
    <img
      v-if="profile"
      class="w-8 h-8 rounded-full"
      :src="profile.avatar_url"
      alt=""
    />
    <div v-else class="w-8 h-8 rounded-full bg-slate-500"></div>
    <div class="text-sm">
      {{ profile?.username ?? 'anon' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Profile } from '../api/types'

defineProps<{
  profile?: Profile
}>()
</script>
