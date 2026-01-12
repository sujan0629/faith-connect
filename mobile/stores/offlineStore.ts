import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type OfflineAction =
  | 'like'
  | 'unlike'
  | 'save'
  | 'unsave'
  | 'comment'
  | 'repost'

export interface QueuedAction {
  id: string
  type: OfflineAction
  postId: string
  payload: any
  timestamp: number
  retries: number
}

type OfflineStore = {
  isOffline: boolean
  queue: QueuedAction[]
  isSyncing: boolean
  syncError: string | null
  
  // Actions
  setOfflineStatus: (offline: boolean) => void
  addToQueue: (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>) => void
  removeFromQueue: (id: string) => void
  updateQueueItem: (id: string, updates: Partial<QueuedAction>) => void
  clearQueue: () => void
  incrementRetries: (id: string) => void
  
  // Persistence
  loadQueue: () => Promise<void>
  saveQueue: () => Promise<void>
  
  // Sync
  setSyncing: (syncing: boolean) => void
  setSyncError: (error: string | null) => void
}

const OFFLINE_QUEUE_KEY = 'offline_queue'

export const useOfflineStore = create<OfflineStore>((set, get) => ({
  isOffline: false,
  queue: [],
  isSyncing: false,
  syncError: null,

  setOfflineStatus: (offline: boolean) => {
    set({ isOffline: offline })
  },

  addToQueue: (action) => {
    const newAction: QueuedAction = {
      ...action,
      id: `${action.type}-${action.postId}-${Date.now()}`,
      timestamp: Date.now(),
      retries: 0,
    }
    
    set((state) => ({
      queue: [...state.queue, newAction],
    }))
    
    get().saveQueue()
  },

  removeFromQueue: (id: string) => {
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    }))
    get().saveQueue()
  },

  updateQueueItem: (id: string, updates: Partial<QueuedAction>) => {
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))
    get().saveQueue()
  },

  clearQueue: () => {
    set({ queue: [] })
    AsyncStorage.removeItem(OFFLINE_QUEUE_KEY)
  },

  incrementRetries: (id: string) => {
    const item = get().queue.find((q) => q.id === id)
    if (item) {
      get().updateQueueItem(id, { retries: item.retries + 1 })
    }
  },

  loadQueue: async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
      if (stored) {
        const queue = JSON.parse(stored)
        set({ queue })
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
    }
  },

  saveQueue: async () => {
    try {
      const queue = get().queue
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  },

  setSyncing: (syncing: boolean) => {
    set({ isSyncing: syncing })
  },

  setSyncError: (error: string | null) => {
    set({ syncError: error })
  },
}))
