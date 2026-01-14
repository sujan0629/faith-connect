import { create } from 'zustand'

type ProfileCache = Record<string, any>

type ProfileState = {
  loading: boolean
  setLoading: (v: boolean) => void
  profileCache: ProfileCache
  currentProfile?: any | null
  setCurrentProfile: (data: any | null) => void
  setProfileCache: (id: string, data: any) => void
  getProfileCache: (id: string) => any
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  currentProfile: null,
  setCurrentProfile: (data: any | null) => set({ currentProfile: data }),
  profileCache: {},
  setProfileCache: (id: string, data: any) => set((s) => ({ profileCache: { ...s.profileCache, [id]: data } })),
  getProfileCache: (id: string) => get().profileCache[id],
}))
