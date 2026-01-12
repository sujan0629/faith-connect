import { create } from 'zustand'
import { notificationsApi, NotificationResponse } from '../api/notifications'
import Toast from 'react-native-toast-message'

export type Notification = NotificationResponse & {
  comment?: string
  replyingTo?: string
}

type NotificationState = {
  items: Notification[]
  loading: boolean
  error: string | null
  
  // Fetch notifications from backend
  fetchNotifications: () => Promise<void>
  
  // Mark single notification as read
  markRead: (id: string) => Promise<void>
  
  // Mark all as read
  markAllAsRead: () => Promise<void>
  
  // Delete notification
  deleteNotification: (id: string) => Promise<void>
  
  // Get unread count
  getUnreadCount: () => number
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null })
    try {
      const notifications = await notificationsApi.getNotifications()
      
      // Map backend notifications to frontend format
      const mappedNotifications: Notification[] = notifications.map((notif) => ({
        ...notif,
        type: notif.type as Notification['type'],
      }))

      set({ items: mappedNotifications, loading: false })
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to load notifications'
      set({ error: errorMessage, loading: false })
      Toast.show({
        type: 'error',
        text1: 'Failed to load notifications',
        text2: errorMessage,
      })
    }
  },

  markRead: async (id: string) => {
    try {
      // Optimistically update UI
      set((state) => ({
        items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }))

      // Call backend
      await notificationsApi.markAsRead(id)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to mark as read'
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      })
      // Revert optimistic update
      await get().fetchNotifications()
    }
  },

  markAllAsRead: async () => {
    try {
      // Optimistically update UI
      set((state) => ({
        items: state.items.map((n) => ({ ...n, read: true })),
      }))

      // Call backend
      await notificationsApi.markAllAsRead()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to mark all as read'
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      })
      // Revert optimistic update
      await get().fetchNotifications()
    }
  },

  deleteNotification: async (id: string) => {
    try {
      // Optimistically remove from UI
      set((state) => ({
        items: state.items.filter((n) => n.id !== id),
      }))

      // Call backend
      await notificationsApi.deleteNotification(id)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete notification'
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      })
      // Revert optimistic update
      await get().fetchNotifications()
    }
  },

  getUnreadCount: () => {
    return get().items.filter((n) => !n.read).length
  },
}))
