import { api } from './axios'
import type { Leader, Follower } from '@faithconnect/shared'

export interface GetLeadersParams {
  faith?: string
  search?: string
}

export const leadersApi = {
  getLeaders: async (params?: GetLeadersParams): Promise<Leader[]> => {
    const response = await api.get('/leaders', { params })
    return response.data
  },

  followLeader: async (leaderId: string): Promise<void> => {
    await api.post(`/leaders/${leaderId}/follow`)
  },

  unfollowLeader: async (leaderId: string): Promise<void> => {
    await api.delete(`/leaders/${leaderId}/follow`)
  },

  getFollowers: async (leaderId: string): Promise<Follower[]> => {
    const response = await api.get(`/leaders/${leaderId}/followers`)
    return response.data
  },

  getFollowing: async (): Promise<Leader[]> => {
    const response = await api.get('/leaders/following')
    return response.data
  },
}