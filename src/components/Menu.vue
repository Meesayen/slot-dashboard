<template>
  <slot :open="menu.open" :toggle="menu.toggle" :close="menu.close" />
  <teleport to=".menu-zone">
    <div
      class="absolute bg-white rounded-md shadow-lg"
      :style="menu.style"
      v-if="menu.status === 'opened'"
    >
      <slot name="content" />
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useMenu } from './menu'

const menu = useMenu()
</script>
