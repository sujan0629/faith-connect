import { create } from 'zustand'

export type Notification = {
  id: string
  title: string
  body: string
  createdAt: string
  unread?: boolean
}

type NotificationState = {
  items: Notification[]
  markRead: (id: string) => void
  seed: () => void
}

const seedNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'New post from Pastor Grace',
    body: 'Morning Reflection is live.',
    createdAt: new Date().toISOString(),
    unread: true,
  },
  {
    id: 'n2',
    title: 'New reel from Imam Kareem',
    body: 'Patience in Practice',
    createdAt: new Date().toISOString(),
    unread: true,
  },
  {
    id: 'n3',
    title: 'Message from Rabbi Leah',
    body: 'Weekly teachings for modern life.',
    createdAt: new Date().toISOString(),
    unread: false,
  },
]

export const useNotificationStore = create<NotificationState>((set) => ({
  items: seedNotifications,
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    })),
  seed: () => set({ items: seedNotifications }),
}))
