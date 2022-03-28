import { ref } from 'vue'
import { api } from './core'
import { Profile } from './types'

const loading = ref(true)
const user = ref()
const profile = ref<Profile>()

async function updateProfile(updatedProfile: Profile) {
  const { data, error } = await api.from('profiles').upsert({
    ...updatedProfile,
    updated_at: new Date(),
  })

  if (error) throw error

  if (data) {
    profile.value = data[0]
  }
}

export function useProfileData() {
  user.value = api.auth.user()

  async function getProfile() {
    profile.value = undefined

    try {
      if (!user.value) return

      let { data, error, status } = await api
        .from('profiles')
        .select(`id, username, nickname, avatar_url`)
        .eq('id', user.value.id)
        .single()

      if (status === 406) {
        try {
          updateProfile({
            id: user.value.id,
            username: user.value.user_metadata.user_name,
            nickname: user.value.user_metadata.user_name,
            avatar_url: user.value.user_metadata.avatar_url,
            email: user.value.user_metadata.email,
          })
        } catch (error) {
          console.log(error)
        } finally {
          loading.value = false
        }
        return
      }

      if (error) throw error

      if (data) {
        profile.value = data
        loading.value = false
      }
    } catch (error) {
      console.log(error)
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
    update: updateProfile,
  }
}
