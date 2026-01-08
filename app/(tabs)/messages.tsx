import { ScrollView, Text, View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { TopBar } from '../../components/Headers/TopBar'
import { useChatStore } from '../../stores/chatStore'

export default function MessagesScreen() {
  const router = useRouter()
  const { threads } = useChatStore()

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <TopBar title="Messages" subtitle="Chats with leaders" />
        {threads.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => router.push(`/messages/${t.id}`)}
            className="mb-3 rounded-2xl border border-gray-200 bg-white p-4"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-semibold text-gray-900">{t.peerName}</Text>
                <Text className="mt-1 text-sm text-gray-600">{t.lastMessage}</Text>
              </View>
              {t.unread > 0 ? (
                <View className="rounded-full bg-blue-500 px-2 py-1">
                  <Text className="text-xs font-semibold text-white">{t.unread}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        ))}

        {threads.length === 0 ? (
          <View className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <Text className="text-sm text-gray-600">No conversations yet. Start by following a leader.</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}
