import { create } from 'zustand'

export type NotificationMention = {
  type: 'mention' | 'comment'
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  isVerified: boolean
  faith: string
  comment: string
  replyingTo?: string
  createdAt: string
  unread?: boolean
}

export type NotificationLike = {
  type: 'like'
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  isVerified: boolean
  actionType: 'post' | 'comment' | 'reply'
  createdAt: string
  unread?: boolean
}

export type Notification = NotificationMention | NotificationLike

type NotificationState = {
  items: Notification[]
  markRead: (id: string) => void
  seed: () => void
}

const seedNotifications: Notification[] = [
  {
    type: 'mention',
    id: 'n1',
    authorId: 'pastor_grace',
    authorName: 'Pastor Grace',
    authorAvatar: 'https://i.pravatar.cc/150?img=1',
    isVerified: true,
    faith: 'Christian',
    comment: 'This is such a powerful message! Thank you for sharing this perspective.',
    replyingTo: 'user123',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unread: true,
  },
  {
    type: 'like',
    id: 'n2',
    authorId: 'imam_kareem',
    authorName: 'Imam Kareem',
    authorAvatar: 'https://i.pravatar.cc/150?img=2',
    isVerified: true,
    actionType: 'post',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    unread: true,
  },
  {
    type: 'comment',
    id: 'n3',
    authorId: 'rabbi_leah',
    authorName: 'Rabbi Leah',
    authorAvatar: 'https://i.pravatar.cc/150?img=3',
    isVerified: true,
    faith: 'Jewish',
    comment: 'I completely agree with your thoughts on this matter. Well articulated!',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unread: false,
  },
  {
    type: 'like',
    id: 'n4',
    authorId: 'priest_james',
    authorName: 'Priest James',
    authorAvatar: 'https://i.pravatar.cc/150?img=4',
    isVerified: true,
    actionType: 'comment',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    unread: false,
  },
  {
    type: 'mention',
    id: 'n5',
    authorId: 'dr_smith',
    authorName: 'Dr. Smith',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    isVerified: false,
    faith: 'Buddhist',
    comment: 'Interesting take on mindfulness practices. Would love to discuss further!',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
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
