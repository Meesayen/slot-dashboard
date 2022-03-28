<template>
  <div class="menu-zone fixed inset-0 z-50"></div>
  <div
    class="modal-zone fixed inset-0 z-50 flex items-center justify-center"
    @click.self="closeAllModals"
  ></div>

  <div class="flex space-x-1 py-1 px-4 bg-indigo-700">
    <div class="flex-1"></div>

    <Menu>
      <template #="{ toggle }">
        <ProfileDisplay
          class="text-white cursor-pointer"
          :profile="profile"
          @click="toggle"
        />
      </template>
      <template #content>
        <ul class="w-32 py-1 cursor-pointer">
          <template v-if="profile">
            <li
              class="py-2 px-4 hover:bg-indigo-50 hover:text-indigo-600 tracking-wider text-xs"
              @click="profileModal.open"
            >
              Profile
            </li>
            <li
              class="py-2 px-4 hover:bg-indigo-50 hover:text-indigo-600 tracking-wider text-xs"
              @click="api.logout"
            >
              Sign out
            </li>
          </template>
          <li
            v-else
            class="py-2 px-4 hover:bg-indigo-50 hover:text-indigo-600 tracking-wider text-xs"
            @click="api.login"
          >
            Sign in
          </li>
        </ul>
      </template>
    </Menu>
  </div>
  <div class="">
    <Slots />
  </div>

  <ProfileModal />
</template>

<script setup lang="ts">
import { useProfileData, useProfileApi } from './api/profile'
import Slots from './components/Slots.vue'
import ProfileDisplay from './components/ProfileDisplay.vue'
import Menu from './components/Menu.vue'
import ProfileModal, { ProfileModalKey } from './components/ProfileModal.vue'
import { useModal, closeAllModals } from './components/Modal.vue'

const { profile, loading } = useProfileData()

const api = useProfileApi()

const profileModal = useModal(ProfileModalKey)
</script>

<style>
.modal-zone:not(:empty) {
  @apply bg-black/60;
}
.modal-zone:empty {
  pointer-events: none;
}
.menu-zone {
  pointer-events: none;
}
.menu-zone > * {
  pointer-events: all;
}
</style>
