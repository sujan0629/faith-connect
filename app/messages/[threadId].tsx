import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { View, Text, FlatList, TextInput, Pressable } from 'react-native'
import { TopBar } from '../../components/Headers/TopBar'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import Toast from 'react-native-toast-message'

export default function ChatThread() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>()
  const router = useRouter()
  const { threads, messages, sendMessage } = useChatStore()
  const user = useAuthStore((s) => s.user)
  const thread = threads.find((t) => t.id === threadId)
  const threadMessages = messages[threadId || ''] || []
  const [content, setContent] = useState('')

  const handleSend = () => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Sign in first' })
      return
    }
    if (!content) return
    sendMessage(threadId!, {
      threadId: threadId!,
      senderId: user.id,
      senderName: user.name,
      content,
      isMine: true,
    })
    setContent('')
  }

  if (!thread) {
    return (
      <View className="flex-1 items-center justify-center bg-[#050914]">
        <Text className="text-white">Thread not found</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#050914]">
      <View className="px-4 pt-14">
        <TopBar title={thread.peerName} onBack={() => router.back()} />
      </View>
      <FlatList
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
        data={threadMessages}
        inverted
        keyExtractor={(m) => m.id}
        renderItem={({ item: m }) => (
          <View
            className={`mb-3 max-w-[80%] rounded-2xl px-4 py-3 ${
              m.isMine ? 'self-end bg-cyan-500/20' : 'self-start bg-white/10'
            }`}
          >
            <Text className="text-sm text-white">{m.content}</Text>
            <Text className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      />
      <View className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#050914] px-4 pb-6 pt-3">
        <View className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <TextInput
            className="flex-1 text-white"
            placeholder="Type a message"
            placeholderTextColor="#64748b"
            value={content}
            onChangeText={setContent}
          />
          <Pressable onPress={handleSend} className="rounded-full bg-cyan-500 px-4 py-2">
            <Text className="text-sm font-semibold text-white">Send</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
