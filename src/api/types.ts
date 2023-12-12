export interface Profile {
  id: string
  username: string
  avatar_url: string
  nickname: string
  email: string
}

export interface Slot {
  id: number
  name: string
  feature: string
  claimed_by: Profile
  available: boolean
  updated_at: string
  is_preprod: boolean
}
