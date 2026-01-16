import { useLocalSearchParams , Stack } from 'expo-router'
import { useDebouncedRouter } from '../../hooks/useDebounce'

import { useState, useRef, useEffect } from 'react'
import { View, Text, FlatList, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { 
  KeyboardAvoidingView, 
  KeyboardGestureArea,
  useKeyboardHandler
} from 'react-native-keyboard-controller'
import Animated, { useSharedValue, useAnimatedStyle, interpolate } from 'react-native-reanimated'


import { ChatHeader } from '../../components/Messages/ChatHeader'
import { MessageBubble } from '../../components/Messages/MessageBubble'
import { ChatInput } from '../../components/Messages/ChatInput'
import { ChatSkeleton } from '../../components/Skeletons/ChatSkeleton'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import Toast from 'react-native-toast-message'

export default function ChatThread() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>()
  const router = useDebouncedRouter()
  const insets = useSafeAreaInsets()
  
  const { threads, messages, sendMessage, fetchThreads, fetchMessages } = useChatStore()
  const user = useAuthStore((s) => s.user)
  
  const pendingMap = useChatStore((s) => s.pendingMap)
  const effectiveThreadId = threadId && String(threadId).startsWith('pending-') ? pendingMap[threadId] ?? threadId : threadId
  const thread = threads.find((t) => t.id === effectiveThreadId)
  const threadMessages = messages[effectiveThreadId || ''] || []
  
  const [content, setContent] = useState('')
  const flatListRef = useRef<FlatList>(null)

  const threadsLoaded = useChatStore((s) => s.threadsLoaded)
  const messagesLoadedForThread = useChatStore((s) => (effectiveThreadId ? s.messagesLoaded[effectiveThreadId] : false))

  // This shared value tracks keyboard progress (0 = closed, 1 = open)
  const progress = useSharedValue(0)

  // useKeyboardHandler runs on the UI thread for 120fps sync
  useKeyboardHandler({
    onMove: (e) => {
      'worklet';
      progress.value = e.progress;
    },
    onEnd: (e) => {
      'worklet';
      progress.value = e.progress;
    },
  })

  // This style dynamically adjusts padding to 0 as the keyboard opens
  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: interpolate(
        progress.value,
        [0, 1],
        [Math.max(insets.bottom, 12), 4] // 4 is a tiny "breathing" gap for the keyboard
      ),
    };
  });

  const handleSend = async (message?: string) => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Sign in first' })
      return
    }
    const msg = (message ?? content).trim()
    if (!msg) return
    try {
      if (!effectiveThreadId) return

      // If this is a pending id, create the real thread first (using peerId embedded in the pending id), set mapping, then send
      if (String(effectiveThreadId).startsWith('pending-')) {
        const raw = String(effectiveThreadId).replace(/^pending-/, '')
        const lastDash = raw.lastIndexOf('-')
        const peerId = lastDash !== -1 ? raw.slice(0, lastDash) : raw
          try {
            // Ensure we have the latest threads list to avoid creating duplicates
            try {
              await useChatStore.getState().fetchThreads()
            } catch {
              // ignore fetch errors here; we'll try createThread below
            }

            // Re-check for existing thread with same peerId
            const existing = useChatStore.getState().threads.find((t) => t.peerId === peerId)
            if (existing) {
              useChatStore.getState().setPendingMapping(effectiveThreadId, existing.id)
              await sendMessage(existing.id, msg)
              return
            }

            // No existing thread found — create a new one
            const realId = await useChatStore.getState().createThread(peerId)
            useChatStore.getState().setPendingMapping(effectiveThreadId, realId)
            await sendMessage(realId, msg)
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to send', text2: 'Could not create conversation' })
          }
        return
      }

      await sendMessage(effectiveThreadId, msg)
      // ChatInput already clears the input instantly via onChangeText('')
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
      }, 100)
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to send', text2: 'Please try again' })
    }
  }

  useEffect(() => {
    if (!threadsLoaded) {
      fetchThreads().catch(() => {
        Toast.show({ type: 'error', text1: 'Failed to load thread' })
      })
    }
  }, [fetchThreads, threadsLoaded])

  useEffect(() => {
    if (!effectiveThreadId) return
    // If this is still a pending optimistic id (not mapped yet), do not call the API — wait for the real thread id.
    if (String(effectiveThreadId).startsWith('pending-')) return
    if (!messagesLoadedForThread) {
      fetchMessages(effectiveThreadId).catch(() => {
        Toast.show({ type: 'error', text1: 'Failed to load messages' })
      })
    }
  }, [effectiveThreadId, fetchMessages, messagesLoadedForThread])

  // Show skeleton only on the initial load (when store hasn't marked the thread/messages as loaded)
  if (!threadsLoaded || (effectiveThreadId && !messagesLoadedForThread)) {
    // Render a real header + input, but skeleton messages in the middle
    return (
      <>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, backgroundColor: 'white' }}
          keyboardVerticalOffset={0}
        >
          <View style={{ paddingTop: insets.top }} className="bg-white border-b border-gray-100 z-10">
            <ChatHeader peerName={thread?.peerName || 'Message'} avatar={thread?.avatar} isActive={thread?.isActive || false} onBack={() => router.back()} />
          </View>

          <View style={{ flex: 1 }} className="bg-white">
            <ChatSkeleton />
          </View>

          <Animated.View style={[{ backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f3f4f6' }, animatedInputStyle]}>
            <ChatInput value={content} onChangeText={setContent} onSend={handleSend} />
          </Animated.View>
        </KeyboardAvoidingView>
      </>
    )
  }

  if (!thread) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-[#111111]">Thread not found</Text>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: 'white' }}
        keyboardVerticalOffset={0} 
      >
        {/* --- Header --- */}
        <View style={{ paddingTop: insets.top }} className="bg-white border-b border-gray-100 z-10">
          <ChatHeader
            peerName={thread.peerName}
            avatar={thread.avatar}
            isActive={thread.isActive}
            onBack={() => router.back()}
          />
        </View>

      {/* --- Message Body --- */}
      <KeyboardGestureArea interpolator="linear" style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={threadMessages}
          inverted
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
          keyExtractor={(m) => m.id}
          renderItem={({ item: m }) => (
            <MessageBubble
              content={m.content}
              timestamp={m.createdAt}
              isMine={m.isMine || false}
              senderName={!m.isMine ? m.senderName : undefined}
              avatar={!m.isMine ? thread?.avatar : undefined}
              status={m.status}
            />
          )}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={true}
        />
      </KeyboardGestureArea>

      {/* --- Animated Docked Input --- */}
      <Animated.View 
        style={[
          { 
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#f3f4f6',
          },
          animatedInputStyle
        ]}
      >
        <ChatInput 
          value={content} 
          onChangeText={setContent} 
          onSend={handleSend}
        />
      </Animated.View>
    </KeyboardAvoidingView>
    </>
  )
}