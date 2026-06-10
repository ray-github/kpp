import { create } from 'zustand'
import { UserProfile, fetchProfile, signInDaily } from '@/services/user'
import { wxLogin } from '@/services/auth'
import { getToken } from '@/services/request'

interface UserState {
  user: UserProfile | null
  loading: boolean
  ensureLogin: () => Promise<UserProfile | null>
  loadProfile: () => Promise<void>
  dailySignIn: () => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,

  ensureLogin: async () => {
    if (getToken()) {
      try {
        const user = await fetchProfile()
        set({ user })
        return user
      } catch {
        // token invalid
      }
    }

    set({ loading: true })
    try {
      const { user } = await wxLogin()
      set({ user, loading: false })
      return user
    } catch (error) {
      set({ loading: false })
      console.error('login failed', error)
      return null
    }
  },

  loadProfile: async () => {
    set({ loading: true })
    try {
      const user = await fetchProfile()
      set({ user, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  dailySignIn: async () => {
    await signInDaily()
    await get().loadProfile()
  },
}))
