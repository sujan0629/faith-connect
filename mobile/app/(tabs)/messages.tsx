import { ScrollView, View, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { MessagesHeader } from '../../components/Headers/MessagesHeader'
import { MessageSearchBar } from '../../components/Messages/MessageSearchBar'
import { MessageThreadCard } from '../../components/Messages/MessageThreadCard'
import { MessageEmptyState } from '../../components/Messages/MessageEmptyState'
import { useChatStore } from '../../stores/chatStore'
import Toast from 'react-native-toast-message'
import { FilterState } from '../../components/FilterDropdown'

export default function MessagesScreen() {
  const router = useRouter()
  const { threads, fetchThreads } = useChatStore()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'Recent',
    status: 'All',
  })
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchThreads()
    } finally {
      setRefreshing(false)
    }
  }

  const filteredThreads = threads
    .filter((t) => {
      if (filters.status === 'Unread') return t.unread
      if (filters.status === 'Read') return !t.unread
      return true
    })
    .filter(
      (t) =>
        (t.peerName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (t.lastMessage?.toLowerCase() || '').includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (filters.sortBy === 'Unread First') {
        if (a.unread && !b.unread) return -1
        if (!a.unread && b.unread) return 1
      }
      if (filters.sortBy === 'Alphabetical') {
        return (a.peerName || '').localeCompare(b.peerName || '')
      }
      // Default to Recent (assuming threads have timestamps)
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    })

  useEffect(() => {
    fetchThreads().catch(() => {
      Toast.show({ type: 'error', text1: 'Failed to load messages', text2: 'Please try again' })
    })
  }, [fetchThreads])

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <MessagesHeader filters={filters} onFiltersChange={setFilters} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        {/* Search Bar */}
        <View className="px-4 pt-2">
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
