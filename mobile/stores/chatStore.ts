import { create } from "zustand";
import { messagesApi } from "../api/messages";
import { useAuthStore } from "./authStore";
import { initSocket, disconnectSocket } from '../lib/socket'

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: string;
  isMine?: boolean;
  status?: "sending" | "sent" | "failed";
};

type Thread = {
  id: string;
  peerId: string;
  peerName: string;
  lastMessage: string;
  unread: number;
  avatar?: string;
  isActive: boolean;
  timestamp: Date;
  peerRole?: string;
};

type ChatState = {
  threads: Thread[];
  messages: Record<string, Message[]>;
  threadsLoaded: boolean;
  messagesLoaded: Record<string, boolean>;
  pendingMap: Record<string, string>;
  fetchThreads: () => Promise<void>;
  fetchMessages: (threadId: string) => Promise<void>;
  createThread: (peerId: string) => Promise<string>;
  sendMessage: (threadId: string, content: string) => Promise<void>;
  setPendingMapping: (pendingId: string, realId: string) => void;
  addPendingThread: (thread: Thread) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  messages: {},
  threadsLoaded: false,
  messagesLoaded: {},
  pendingMap: {},

  fetchThreads: async () => {
    const data = await messagesApi.listThreads();
    const normalized: Thread[] = data.map((t) => ({
      ...t,
      timestamp: new Date(t.timestamp),
    }));
    set((state) => ({
      threads: [...normalized, ...state.threads.filter((t) => String(t.id).startsWith('pending-'))],
      threadsLoaded: true,
    }));
  },

  fetchMessages: async (threadId: string) => {
    try {
      const data = await messagesApi.getMessages(threadId);
      const userId = useAuthStore.getState().user?.id;
      const normalized: Message[] = data.map((m) => ({
        ...m,
        isMine: m.senderId === userId,
        createdAt:
          typeof m.createdAt === "string"
            ? m.createdAt
            : new Date(m.createdAt as any).toISOString(),
      }));
      set((state) => ({
        messages: { ...state.messages, [threadId]: normalized },
        threads: state.threads.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)),
        messagesLoaded: { ...state.messagesLoaded, [threadId]: true },
      }));
    } catch (err) {
      // Ensure we don't leave the UI in a perpetual loading state; mark messages as "loaded"
      set((state) => ({ messagesLoaded: { ...state.messagesLoaded, [threadId]: true } }));
      throw err;
    }
  },

  createThread: async (peerId: string) => {
    const res = await messagesApi.createThread(peerId);
    await get().fetchThreads();
    return res.id;
  },

  removePendingThread: (pendingId: string) => {
    set((state) => ({
      threads: state.threads.filter((t) => t.id !== pendingId),
    }))
  },

  setPendingMapping: (pendingId: string, realId: string) => {
    set((state) => {
      // Remove optimistic pending thread entry if present to avoid duplicates
      const threads = state.threads.filter((t) => t.id !== pendingId)
      return {
        pendingMap: { ...state.pendingMap, [pendingId]: realId },
        threads,
      }
    })
  },

  // add an optimistic pending thread so UI can display header/avatar immediately
  addPendingThread: (thread: Thread) => {
    set((state) => ({ threads: [thread, ...state.threads] }))
  },

  sendMessage: async (threadId: string, content: string) => {
    const userId = useAuthStore.getState().user?.id;
    const tempId = `temp-${Date.now()}`; // temporary id for the sending message
    const tempMessage: Message = {
      id: tempId,
      threadId,
      senderId: userId || "",
      senderName: useAuthStore.getState().user?.name,
      content,
      createdAt: new Date().toISOString(),
      isMine: true,
      status: "sending",
    };

    // Add the message instantly
    set((state) => {
      const existing = state.messages[threadId] || [];
      const updatedMessages = {
        ...state.messages,
        [threadId]: [tempMessage, ...existing],
      };
      const updatedThreads = state.threads.map((t) =>
        t.id === threadId
          ? { ...t, lastMessage: content, unread: 0, timestamp: new Date() }
          : t
      );
      return { messages: updatedMessages, threads: updatedThreads };
    });

    try {
      const message = await messagesApi.sendMessage(threadId, content);
      const normalized: Message = {
        ...message,
        isMine: message.senderId === userId,
        createdAt:
          typeof message.createdAt === "string"
            ? message.createdAt
            : new Date(message.createdAt as any).toISOString(),
        status: "sent",
      };

      // Replace the temp message with the real one
      set((state) => {
        const existing = state.messages[threadId] || [];
        const updatedMessages = {
          ...state.messages,
          [threadId]: existing.map((m) => (m.id === tempId ? normalized : m)),
        };
        return { messages: updatedMessages };
      });
    } catch (error) {
      // Mark as failed
      set((state) => {
        const existing = state.messages[threadId] || [];
        const updatedMessages = {
          ...state.messages,
          [threadId]: existing.map((m) =>
            m.id === tempId ? { ...m, status: "failed" as const } : m
          ),
        };
        return { messages: updatedMessages };
      });
      throw error;
    }
  },
}));

// Initialize socket LAZILY when first needed (when user accesses messages)
// This prevents blocking the initial app startup
let socketInitialized = false

export const initializeSocketForMessaging = () => {
  if (socketInitialized) return
  socketInitialized = true

  let prevToken: string | undefined = useAuthStore.getState().accessToken
  useAuthStore.subscribe((state) => {
    const token = state.accessToken
    if (token === prevToken) return
    prevToken = token

    if (token) {
      const socket = initSocket(token)
      if (!socket) return

      const onMessage = (payload: any) => {
        try {
          const currentUserId = useAuthStore.getState().user?.id
          useChatStore.setState((state) => {
            const existing = state.messages[payload.threadId] || []
            if (existing.some((m) => m.id === payload.id)) return state

            const updatedMessages = {
              ...state.messages,
              [payload.threadId]: [
                {
                  id: payload.id,
                  threadId: payload.threadId,
                  senderId: payload.senderId,
                  senderName: payload.senderName,
                  content: payload.content,
                  createdAt:
                    typeof payload.createdAt === 'string'
                      ? payload.createdAt
                      : new Date(payload.createdAt).toISOString(),
                  isMine: payload.senderId === currentUserId,
                },
                ...existing,
              ],
            }

            const updatedThreads = state.threads.map((t) =>
              t.id === payload.threadId
                ? {
                    ...t,
                    lastMessage: payload.content,
                    unread:
                      payload.senderId === currentUserId
                        ? t.unread
                        : (t.unread ?? 0) + 1,
                    timestamp: new Date(payload.createdAt),
                  }
                : t,
            )

            return {
              messages: updatedMessages,
              threads: updatedThreads,
              messagesLoaded: { ...state.messagesLoaded, [payload.threadId]: true },
            }
          })
        } catch (e) {
          console.warn('[ChatStore] failed to handle incoming socket message', e)
        }
      }

      socket.on('message:new', onMessage)
      socket.on('connect', () => console.log('[ChatStore] socket connected'))
      socket.on('disconnect', () => console.log('[ChatStore] socket disconnected'))
    } else {
      try {
        disconnectSocket()
      } catch {}
    }
  })
}
