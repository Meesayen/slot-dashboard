<template>
  <div
    class="border transition-all cursor-pointer rounded-full text-xs uppercase tracking-wider px-4 py-2 border-indigo-500 ring-teal-200 hover:ring-2"
    :class="[
      type === 'secondary'
        ? 'bg-teal-50 text-indigo-500  '
        : 'bg-indigo-500 text-white ',
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'primary' | 'secondary'
}>()
</script>
