import { ref } from 'vue'
import { api } from './core'
import { Profile } from './types'

export function useProfileData() {
  const user = ref()
  const profile = ref<Profile>()
  const loading = ref(true)

  async function getProfile() {
    try {
      user.value = api.auth.user()

      if (!user.value) return

      let { data, error, status } = await api
        .from('profiles')
        .select(`id, username, website, avatar_url`)
        .eq('id', user.value.id)
        .single()

      if (status === 406) {
        updateProfile()
      }

      if (error && status !== 406) throw error

      if (data) {
        profile.value = data
        loading.value = false
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function updateProfile() {
    try {
      // loading.value = true
      user.value = api.auth.user()

      const updates = {
        id: user.value.id,
        username: user.value.user_metadata.user_name,
        avatar_url: user.value.user_metadata.avatar_url,
        updated_at: new Date(),
      }

      const { data, error } = await api.from('profiles').upsert(updates)
      if (error) throw error

      if (data) {
        profile.value = data[0]
        loading.value = false
      }
    } catch (error) {
      console.log(error)
    } finally {
      // loading.value = false
    }
  }

  getProfile()

  return { profile, loading }
}

export function useProfileApi() {
  function login() {
    api.auth.signIn({
      provider: 'github',
    })
  }
  function logout() {
    api.auth.signOut()
  }

  return {
    login,
    logout,
  }
}
