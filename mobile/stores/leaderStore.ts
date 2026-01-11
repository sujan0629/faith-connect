import { create } from 'zustand'
import { Role } from './authStore'

export type Leader = {
  id: string
  name: string
  faith: string
  bio: string
  avatar?: string
  isFollowed?: boolean
}

type LeaderState = {
  leaders: Leader[]
  followers: Record<string, string[]> // leaderId -> userIds
  follow: (leaderId: string, userId: string) => void
  unfollow: (leaderId: string, userId: string) => void
  seed: (role?: Role) => void
}

const seedLeaders = (): Leader[] => [
  {
    id: 'l1',
    name: 'Pastor Grace',
    faith: 'Christianity',
    bio: 'Guiding with compassion and clarity.',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFzdG9yfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    isFollowed: false,
  },
  {
    id: 'l2',
    name: 'Imam Kareem',
    faith: 'Islam',
    bio: 'Sharing reflections on patience and mercy.',
    isFollowed: false,
  },
  {
    id: 'l3',
    name: 'Rabbi Leah',
    faith: 'Judaism',
    bio: 'Weekly teachings for modern life.',
    isFollowed: false,
  },
   {
    id: 'l4',
    name: 'Pastor Grace',
    faith: 'Christianity',
    bio: 'Guiding with compassion and clarity.',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFzdG9yfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    isFollowed: false,
  },
  {
    id: 'l5',
    name: 'Imam Kareem',
    faith: 'Islam',
    bio: 'Sharing reflections on patience and mercy.',
    isFollowed: false,
  },
  {
    id: 'l6',
    name: 'Rabbi Leah',
    faith: 'Judaism',
    bio: 'Weekly teachings for modern life.',
    isFollowed: false,
  },
   {
    id: 'l7',
    name: 'Pastor Grace',
    faith: 'Christianity',
    bio: 'Guiding with compassion and clarity.',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFzdG9yfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    isFollowed: false,
  },
  {
    id: 'l8',
    name: 'Imam Kareem',
    faith: 'Islam',
    bio: 'Sharing reflections on patience and mercy.',
    isFollowed: false,
  },
  {
    id: 'l9',
    name: 'Rabbi Leah',
    faith: 'Judaism',
    bio: 'Weekly teachings for modern life.',
    isFollowed: false,
  },
]

export const useLeaderStore = create<LeaderState>((set, get) => ({
  leaders: seedLeaders(),
  followers: {
    l1: [],
    l2: [],
    l3: [],
  },
  follow: (leaderId, userId) =>
    set((state) => ({
      leaders: state.leaders.map((l) => (l.id === leaderId ? { ...l, isFollowed: true } : l)),
      followers: {
        ...state.followers,
        [leaderId]: Array.from(new Set([...(state.followers[leaderId] || []), userId])),
      },
    })),
  unfollow: (leaderId, userId) =>
    set((state) => ({
      leaders: state.leaders.map((l) => (l.id === leaderId ? { ...l, isFollowed: false } : l)),
      followers: {
        ...state.followers,
        [leaderId]: (state.followers[leaderId] || []).filter((id) => id !== userId),
      },
    })),
  seed: () => set({ leaders: seedLeaders(), followers: { l1: [], l2: [], l3: [] } }),
}))
