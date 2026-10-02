import { create } from 'zustand'
import type { PublicUser } from '@/lib/types'

interface AuthState {
  user: PublicUser | null
  accessToken: string | null
  refreshToken: string | null
  setSession: (user: PublicUser, accessToken: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readJson('brasa.user'),
  accessToken: localStorage.getItem('brasa.access'),
  refreshToken: localStorage.getItem('brasa.refresh'),
  setSession: (user, accessToken, refreshToken) => {
    localStorage.setItem('brasa.user', JSON.stringify(user))
    localStorage.setItem('brasa.access', accessToken)
    localStorage.setItem('brasa.refresh', refreshToken)
    set({ user, accessToken, refreshToken })
  },
  logout: () => {
    localStorage.removeItem('brasa.user')
    localStorage.removeItem('brasa.access')
    localStorage.removeItem('brasa.refresh')
    set({ user: null, accessToken: null, refreshToken: null })
  },
}))

function readJson(key: string): PublicUser | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PublicUser
  } catch {
    return null
  }
}
