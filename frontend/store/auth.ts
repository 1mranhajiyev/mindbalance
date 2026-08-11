import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  full_name: string
  email: string
  role: 'patient' | 'psychologist'
  totp_enabled: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'mindbalance-auth' }
  )
)
