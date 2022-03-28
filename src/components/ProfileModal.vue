<template>
  <Modal title="Profile" :modalKey="ProfileModalKey">
    <template #content v-if="profile">
      <div class="flex flex-col space-y-2 w-64 mx-auto">
        <img
          :src="profile?.avatar_url"
          class="rounded-full h-24 w-24 mx-auto"
        />

        <div class="text-center">{{ profile?.username }}</div>

        <div class="text-[0.6rem] uppercase tracking-wider font-bold">
          Nickname
        </div>
        <input
          type="text"
          v-model="nickname"
          :placeholder="profile?.username"
        />
      </div>
    </template>

    <template #footer>
      <Button @click="save" :disabled="pristine">save</Button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { createModalKey } from './Modal.vue'
export const ProfileModalKey = createModalKey('profile-modal')
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from './Button.vue'
import Modal, { useModal } from './Modal.vue'
import { useProfileApi, useProfileData } from '../api/profile'

const modal = useModal(ProfileModalKey)
const { profile } = useProfileData()
const api = useProfileApi()

const pristine = ref(true)
const nickname = ref('')

watch(
  profile,
  (p) => {
    nickname.value = p?.nickname ?? ''
    pristine.value = true
  },
  { immediate: true }
)

watch(nickname, () => {
  pristine.value = false
})

function save() {
  modal.close()
  if (!profile.value) return

  api.update({
    ...profile.value,
    nickname: nickname.value,
  })
}
</script>
