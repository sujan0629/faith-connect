import { ScrollView, View, RefreshControl, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDebouncedRouter } from '../../hooks/useDebounce'
import { useEffect, useState } from 'react'
import { MessagesHeader } from '../../components/Headers/MessagesHeader'
import { MessageSearchBar } from '../../components/Messages/MessageSearchBar'
import { MessageThreadCard } from '../../components/Messages/MessageThreadCard'
import { MessageEmptyState } from '../../components/Messages/MessageEmptyState'
import { MessagesSkeleton } from '../../components/Skeletons/MessageSkeleton'
import { useChatStore, initializeSocketForMessaging } from '../../stores/chatStore'
import Toast from 'react-native-toast-message'
import { FilterState } from '../../components/FilterDropdown'
import { useNetworkSync } from '../../hooks/useNetworkSync'
import { cacheFeedForOffline, getCachedFeedForOffline } from '../../lib/caching'
import { useOfflineStore } from '../../stores/offlineStore';
import { Ionicons } from '@expo/vector-icons'
import { useHideTabOnScroll } from '../../hooks/useHideTabOnScroll'

export default function MessagesScreen() {
  const router = useDebouncedRouter()
  const { threads, fetchThreads } = useChatStore()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'Recent',
    status: 'All',
  })
  const [refreshing, setRefreshing] = useState(false)
  const { isOffline } = useNetworkSync()
  const { isSyncing, syncError } = useOfflineStore()
  const onScroll = useHideTabOnScroll()

  // Initialize socket connection when user first accesses messages
  useEffect(() => {
    initializeSocketForMessaging()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchThreads()
      // Cache the threads after successful fetch
      await cacheFeedForOffline('messages_threads', threads)
    } catch (error) {
      console.error('Failed to refresh messages:', error)
      if (isOffline) {
        Toast.show({ type: 'info', text1: 'Offline', text2: 'Using cached messages' })
      }
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
    const loadThreads = async () => {
      try {
        await fetchThreads()
        // Cache threads after successful fetch
        await cacheFeedForOffline('messages_threads', threads)
      } catch (error) {
        console.error('Failed to fetch messages:', error)
        // Try to load from cache if network fails
        if (isOffline) {
          const cached = await getCachedFeedForOffline('messages_threads')
          if (cached) {
            Toast.show({ type: 'info', text1: 'Offline', text2: 'Showing cached messages' })
          }
        } else {
          Toast.show({ type: 'error', text1: 'Failed to load messages', text2: 'Please try again' })
        }
      } finally {
        setLoading(false)
      }
    }
    loadThreads()
  }, [fetchThreads])

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
     {isOffline && (
        <View className="bg-gray-100 px-4 py-2 flex-row items-center gap-2">
          <Ionicons name="warning" size={16} color="#3b82f6" />
          <Text className="text-xs font-medium text-gray-800">
            {isSyncing ? 'Syncing offline changes...' : syncError ? 'Sync failed' : 'Offline mode'}
          </Text>
        </View>
      )}
      <MessagesHeader filters={filters} onFiltersChange={setFilters} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} onScroll={onScroll} scrollEventThrottle={16} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        {/* Search Bar */}
        <View className="px-4 pt-2">
          <MessageSearchBar value={search} onChange={setSearch} />
        </View>

        {/* Threads List or Loading */}
        <View className="px-4">
          {loading ? (
            <MessagesSkeleton />
          ) : (
            <>
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
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
