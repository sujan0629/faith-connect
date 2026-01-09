import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState, useRef } from 'react'
import { View, Text, FlatList, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { 
  KeyboardAvoidingView, 
  KeyboardGestureArea,
  useKeyboardHandler
} from 'react-native-keyboard-controller'
import { useSharedValue, useAnimatedStyle, interpolate } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'

import { ChatHeader } from '../../components/Messages/ChatHeader'
import { MessageBubble } from '../../components/Messages/MessageBubble'
import { ChatInput } from '../../components/Messages/ChatInput'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import Toast from 'react-native-toast-message'

export default function ChatThread() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  
  const { threads, messages, sendMessage } = useChatStore()
  const user = useAuthStore((s) => s.user)
  
  const thread = threads.find((t) => t.id === threadId)
  const threadMessages = messages[threadId || ''] || []
  
  const [content, setContent] = useState('')
  const flatListRef = useRef<FlatList>(null)

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

  const handleSend = () => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Sign in first' })
      return
    }
    if (!content.trim()) return
    
    sendMessage(threadId!, {
      threadId: threadId!,
      senderId: user.id,
      senderName: user.name,
      content: content.trim(),
      isMine: true,
    })
    
    setContent('')
    
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
    }, 100)
  }

  if (!thread) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-[#111111]">Thread not found</Text>
      </View>
    )
  }

  return (
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
  )
}