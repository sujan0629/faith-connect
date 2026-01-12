import { create } from 'zustand'
import { messagesApi } from '../api/messages'
import { useAuthStore } from './authStore'

export type Message = {
  id: string
  threadId: string
  senderId: string
  senderName?: string
  content: string
  createdAt: string
  isMine?: boolean
  status?: 'sending' | 'sent' | 'failed'
}

type Thread = {
  id: string
  peerId: string
  peerName: string
  lastMessage: string
  unread: number
  avatar?: string
  isActive: boolean
  timestamp: Date
  peerRole?: string
}

type ChatState = {
  threads: Thread[]
  messages: Record<string, Message[]>
  fetchThreads: () => Promise<void>
  fetchMessages: (threadId: string) => Promise<void>
  createThread: (peerId: string) => Promise<string>
  sendMessage: (threadId: string, content: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  messages: {},

  fetchThreads: async () => {
    const data = await messagesApi.listThreads()
    const normalized: Thread[] = data.map((t) => ({
      ...t,
      timestamp: new Date(t.timestamp),
    }))
    set({ threads: normalized })
  },

  fetchMessages: async (threadId: string) => {
    const data = await messagesApi.getMessages(threadId)
    const userId = useAuthStore.getState().user?.id
    const normalized: Message[] = data.map((m) => ({
      ...m,
      isMine: m.senderId === userId,
      createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date(m.createdAt as any).toISOString(),
    }))
    set((state) => ({
      messages: { ...state.messages, [threadId]: normalized },
      threads: state.threads.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)),
    }))
  },

  createThread: async (peerId: string) => {
    const res = await messagesApi.createThread(peerId)
    await get().fetchThreads()
    return res.id
  },

  sendMessage: async (threadId: string, content: string) => {
    const userId = useAuthStore.getState().user?.id
    const tempId = `temp-${Date.now()}` // temporary id for the sending message
    const tempMessage: Message = {
      id: tempId,
      threadId,
      senderId: userId || '',
      senderName: useAuthStore.getState().user?.name,
      content,
      createdAt: new Date().toISOString(),
      isMine: true,
      status: 'sending',
    }

    // Add the message instantly
    set((state) => {
      const existing = state.messages[threadId] || []
      const updatedMessages = { ...state.messages, [threadId]: [tempMessage, ...existing] }
      const updatedThreads = state.threads.map((t) =>
        t.id === threadId ? { ...t, lastMessage: content, unread: 0, timestamp: new Date() } : t,
      )
      return { messages: updatedMessages, threads: updatedThreads }
    })

    try {
      const message = await messagesApi.sendMessage(threadId, content)
      const normalized: Message = {
        ...message,
        isMine: message.senderId === userId,
        createdAt: typeof message.createdAt === 'string' ? message.createdAt : new Date(message.createdAt as any).toISOString(),
        status: 'sent',
      }

      // Replace the temp message with the real one
      set((state) => {
        const existing = state.messages[threadId] || []
        const updatedMessages = { ...state.messages, [threadId]: existing.map((m) => m.id === tempId ? normalized : m) }
        return { messages: updatedMessages }
      })
    } catch (error) {
      // Mark as failed
      set((state) => {
        const existing = state.messages[threadId] || []
        const updatedMessages = { ...state.messages, [threadId]: existing.map((m) => m.id === tempId ? { ...m, status: 'failed' as const } : m) }
        return { messages: updatedMessages }
      })
      throw error
    }
  },
}))
