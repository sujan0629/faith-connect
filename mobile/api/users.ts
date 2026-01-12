import { api } from './axios'
import type { UserProfile } from '@faithconnect/shared'

export const usersApi = {
  getMe: async (): Promise<UserProfile> => {
    const res = await api.get('/users/me')
    return res.data
  },

  getById: async (id: string): Promise<UserProfile & { followersCount?: number; followingCount?: number; isFollowing?: boolean }> => {
    const res = await api.get(`/users/${id}`)
    return res.data
  },

  getMyStats: async (): Promise<{ followersCount: number; followingCount: number }> => {
    const res = await api.get('/users/me/stats')
    return res.data
  },
}
