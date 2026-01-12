import { api } from './axios'

export type ReportReason = 'spam' | 'harassment' | 'hate_speech' | 'inappropriate_content' | 'misinformation' | 'copyright' | 'other'
export type ReportedType = 'user' | 'post' | 'reel'

export const moderationApi = {
  // Block a user
  blockUser: async (userId: string) => {
    const res = await api.post(`/users/${userId}/block`)
    return res.data
  },

  // Unblock a user
  unblockUser: async (userId: string) => {
    const res = await api.delete(`/users/${userId}/block`)
    return res.data
  },

  // Get blocked users
  getBlockedUsers: async () => {
    const res = await api.get('/users/me/blocked')
    return res.data
  },

  // Report a user or post
  reportContent: async (
    reportedId: string,
    reportedType: ReportedType,
    reason: ReportReason,
    description?: string,
  ) => {
    const res = await api.post('/users/report', {
      reportedId,
      reportedType,
      reason,
      description,
    })
    return res.data
  },
}
