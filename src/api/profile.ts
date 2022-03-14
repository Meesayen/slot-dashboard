import { ref } from 'vue'
import { api } from './core'
import { Profile } from './types'

const loading = ref(true)
const user = ref()
const profile = ref<Profile>()

export function useProfileData() {
  user.value = api.auth.user()

  async function getProfile() {
    profile.value = undefined

    try {
      if (!user.value) return

      let { data, error, status } = await api
        .from('profiles')
        .select(`id, username, website, avatar_url`)
        .eq('id', user.value.id)
        .single()

      if (status === 406) {
        updateProfile()
        return
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
      const updates = {
        id: user.value.id,
        username: user.value.user_metadata.user_name,
        avatar_url: user.value.user_metadata.avatar_url,
        email: user.value.user_metadata.email,
        updated_at: new Date(),
      }

      const { data, error } = await api.from('profiles').upsert(updates)
      if (error) throw error

      if (data) {
        profile.value = data[0]
      }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  api.auth.onAuthStateChange((_, session) => {
    user.value = session?.user
    getProfile()
  })

  return { profile, loading }
}

export function useProfileApi() {
  function login() {
    api.auth.signIn(
      {
        provider: 'github',
      },
      {
        redirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL as string,
      }
    )
  }
  function logout() {
    api.auth.signOut()
  }

  return {
    login,
    logout,
  }
}
