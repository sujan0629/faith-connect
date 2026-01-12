import { create } from 'zustand'
import { Role } from './authStore'
import { leadersApi } from '../api/leaders'
import { useFollowStore } from './followStore'
import type { Leader } from '@faithconnect/shared'

type LeaderState = {
  leaders: Leader[]
  loading: boolean
  error: string | null
  fetchLeaders: (filters?: { faith?: string; search?: string }) => Promise<void>
  follow: (leaderId: string, userId: string) => Promise<void>
  unfollow: (leaderId: string, userId: string) => Promise<void>
  seed: (role?: Role) => void
}

export const useLeaderStore = create<LeaderState>((set, get) => ({
  leaders: [],
  loading: false,
  error: null,

  fetchLeaders: async (filters) => {
    set({ loading: true, error: null })
    try {
      const leaders = await leadersApi.getLeaders(filters)
      set({ leaders, loading: false })
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || 'Failed to fetch leaders',
        loading: false
      })
    }
  },

  follow: async (leaderId, userId) => {
    try {
      await leadersApi.followLeader(leaderId)
      // Update follow store
      useFollowStore.getState().addFollowing(leaderId)
      // Update local state optimistically
      set((state) => ({
        leaders: state.leaders.map((l) =>
          l.id === leaderId ? { ...l, isFollowed: true, followersCount: (l.followersCount || 0) + 1 } : l
        ),
      }))
    } catch (error: any) {
      set({ error: error?.response?.data?.message || 'Failed to follow leader' })
      throw error
    }
  },

  unfollow: async (leaderId, userId) => {
    try {
      await leadersApi.unfollowLeader(leaderId)
      // Update follow store
      useFollowStore.getState().removeFollowing(leaderId)
      // Update local state optimistically
      set((state) => ({
        leaders: state.leaders.map((l) =>
          l.id === leaderId ? { ...l, isFollowed: false, followersCount: Math.max((l.followersCount || 0) - 1, 0) } : l
        ),
      }))
    } catch (error: any) {
      set({ error: error?.response?.data?.message || 'Failed to unfollow leader' })
      throw error
    }
  },

  seed: () => set({ leaders: [], loading: false, error: null }),
}))
