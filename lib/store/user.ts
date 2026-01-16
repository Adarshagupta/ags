import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: string
}

interface UserStore {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      
      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
