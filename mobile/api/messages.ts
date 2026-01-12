import { api } from './axios'

export type ThreadDto = {
  id: string
  peerId: string
  peerName: string
  avatar?: string
  lastMessage: string
  unread: number
  isActive: boolean
  timestamp: string
  peerRole?: string
}

export type MessageDto = {
  id: string
  threadId: string
  senderId: string
  senderName?: string
  content: string
  createdAt: string
  isMine?: boolean
}

export const messagesApi = {
  listThreads: async (): Promise<ThreadDto[]> => {
    const res = await api.get('/messages/threads')
    return res.data
  },
  createThread: async (peerId: string): Promise<{ id: string }> => {
    const res = await api.post('/messages/threads', { peerId })
    return res.data
  },
  getMessages: async (threadId: string): Promise<MessageDto[]> => {
    const res = await api.get(`/messages/threads/${threadId}/messages`)
    return res.data
  },
  sendMessage: async (threadId: string, content: string): Promise<MessageDto> => {
    const res = await api.post(`/messages/threads/${threadId}/messages`, { content })
    return res.data
  },
}
