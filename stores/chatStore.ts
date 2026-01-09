import { create } from 'zustand'

export type Message = {
  id: string
  threadId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
  isMine?: boolean
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
}

type ChatState = {
  threads: Thread[]
  messages: Record<string, Message[]>
  sendMessage: (threadId: string, payload: Omit<Message, 'id' | 'createdAt'>) => void
  seed: () => void
}

const seedThreads: Thread[] = [
  {
    id: 't1',
    peerId: 'l1',
    peerName: 'Pastor Grace',
    lastMessage: 'Thank you for the guidance.',
    unread: 1,
    avatar: 'https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww',
    isActive: false,
    timestamp: new Date(),
  },
  {
    id: 't2',
    peerId: 'l2',
    peerName: 'Imam Kareem',
    lastMessage: 'When is the next session?',
    unread: 0,
    avatar: 'https://miro.medium.com/v2/resize:fit:1400/1*zurzWYgv6-4L123HBwzsKA.jpeg',
    isActive: false,
    timestamp: new Date(),
  },
]

const seedMessages: Record<string, Message[]> = {
  t1: [
    {
      id: 'm1',
      threadId: 't1',
      senderId: 'l1',
      senderName: 'Pastor Grace',
      content: 'Stay hopeful and kind today.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'm2',
      threadId: 't1',
      senderId: 'me',
      senderName: 'You',
      content: 'Thank you for the guidance.',
      createdAt: new Date().toISOString(),
      isMine: true,
    },
  ],
  t2: [
    {
      id: 'm3',
      threadId: 't2',
      senderId: 'l2',
      senderName: 'Imam Kareem',
      content: 'Remember patience brings clarity.',
      createdAt: new Date().toISOString(),
    },
  ],
}

export const useChatStore = create<ChatState>((set, get) => ({
  threads: seedThreads,
  messages: seedMessages,
  sendMessage: (threadId, payload) =>
    set((state) => {
      const message = {
        ...payload,
        id: `msg-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      const existing = state.messages[threadId] || []
      // Add new message at the beginning since FlatList is inverted
      const updatedMessages = { ...state.messages, [threadId]: [message, ...existing] }
      const updatedThreads = state.threads.map((t) =>
        t.id === threadId ? { ...t, lastMessage: payload.content, unread: 0 } : t,
      )
      return { messages: updatedMessages, threads: updatedThreads }
    }),
  seed: () => set({ threads: seedThreads, messages: seedMessages }),
}))
