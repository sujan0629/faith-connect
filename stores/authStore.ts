import { create } from 'zustand'

export type Role = 'worshiper' | 'leader'

export type UserProfile = {
  id: string
  email: string
  name: string
  role: Role
  faith?: string
  bio?: string
  avatar?: string
  hasProfile: boolean
}

type AuthState = {
  user?: UserProfile
  rolePreference: Role
  isAuthenticated: boolean
  setRolePreference: (role: Role) => void
  login: (payload: { email: string; name?: string }) => void
  signup: (payload: { email: string; name: string; role: Role }) => void
  completeProfile: (payload: Partial<UserProfile>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: undefined,
  rolePreference: 'worshiper',
  isAuthenticated: false,
  setRolePreference: (role) => set({ rolePreference: role }),
  login: ({ email, name }) => {
    const role = get().rolePreference
    set({
      user: {
        id: `user-${Date.now()}`,
        email,
        name: name || 'FaithConnect User',
        role,
        hasProfile: false,
      },
      isAuthenticated: true,
    })
  },
  signup: ({ email, name, role }) =>
    set({
      user: {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        hasProfile: false,
      },
      rolePreference: role,
      isAuthenticated: true,
    }),
  completeProfile: (payload) => {
    const current = get().user
    if (!current) return
    set({ user: { ...current, ...payload, hasProfile: true } })
  },
  logout: () => set({ user: undefined, isAuthenticated: false }),
}))
