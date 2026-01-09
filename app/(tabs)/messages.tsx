import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { TopBar } from '../../components/Headers/TopBar'
import { MessageSearchBar } from '../../components/Messages/MessageSearchBar'
import { MessageThreadCard } from '../../components/Messages/MessageThreadCard'
import { MessageEmptyState } from '../../components/Messages/MessageEmptyState'
import { useChatStore } from '../../stores/chatStore'

export default function MessagesScreen() {
  const router = useRouter()
  const { threads } = useChatStore()
  const [search, setSearch] = useState('')

  const filteredThreads = threads.filter(
    (t) =>
      t.peerName.toLowerCase().includes(search.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-4 pt-2">
          <TopBar title="Messages" />
          <MessageSearchBar value={search} onChange={setSearch} />
        </View>

        {/* Threads List */}
        <View className="px-4">
          {filteredThreads.map((t) => (
            <MessageThreadCard
              key={t.id}
              id={t.id}
              peerName={t.peerName}
              lastMessage={t.lastMessage}
              avatar={t.avatar}
              isActive={t.isActive}
              unread={t.unread}
              timestamp={t.timestamp}
              onPress={() => router.push(`/messages/${t.id}`)}
            />
          ))}

          {filteredThreads.length === 0 && <MessageEmptyState hasSearch={search.length > 0} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
