import { create } from 'zustand'

export type Role = 'worshiper' | 'leader'

export type UserProfile = {
  id: string
  email: string
  name: string
  username?: string
  role: Role
  faith?: string
  bio?: string
  avatar?: string
  hasProfile: boolean
  denomination?: string
  contentFocus?: string[]
  audiencePrefs?: string[]
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
  user: {
    id: 'demo-user-123',
    email: 'demo@example.com',
    name: 'Demo User',
    username: 'demo_user',
    avatar: 'https://cdn.jumpshare.com/preview/n4cDyccgwamUidVDSBH6TUAs1n9_gpa-rBTcqzbDAX8O8G17kFotg9f8A_9scjA-c26Fs5dRhPPIsaiM61dz1RVfgEFiqK-XSAZ9q3uZfTY',
    role: 'worshiper' as Role,
    hasProfile: true,
    faith: 'Christianity',
  },
  rolePreference: 'worshiper',
  isAuthenticated: true,
  setRolePreference: (role) => set({ rolePreference: role }),
  login: ({ email, name }) => {
    const role = get().rolePreference
    set({
      user: {
        id: `user-${Date.now()}`,
        email,
        name: name || 'FaithConnect User',
        username: 's.u.jan_02',
        avatar: 'https://cdn.jumpshare.com/preview/n4cDyccgwamUidVDSBH6TUAs1n9_gpa-rBTcqzbDAX8O8G17kFotg9f8A_9scjA-c26Fs5dRhPPIsaiM61dz1RVfgEFiqK-XSAZ9q3uZfTY',
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
        username: 's.u.jan_02',
        avatar: 'https://cdn.jumpshare.com/preview/n4cDyccgwamUidVDSBH6TUAs1n9_gpa-rBTcqzbDAX8O8G17kFotg9f8A_9scjA-c26Fs5dRhPPIsaiM61dz1RVfgEFiqK-XSAZ9q3uZfTY',
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
