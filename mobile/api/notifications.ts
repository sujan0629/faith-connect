import { api } from './axios'

export interface NotificationResponse {
  id: string
  recipientId: string
  actorId: string
  actorName: string
  actorAvatar?: string
  type: 'like' | 'comment' | 'reply' | 'mention' | 'repost' | 'save' | 'follow'
  postId?: string
  commentId?: string
  content?: string
  read: boolean
  actionType?: 'post' | 'comment' | 'reply'
  createdAt: string
  isVerified?: boolean
}

export const notificationsApi = {
  getNotifications: async (): Promise<NotificationResponse[]> => {
    const res = await api.get('/notifications')
    return res.data
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get('/notifications/unread-count')
    return res.data.count
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`)
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/mark-all/read')
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`)
  },
}
