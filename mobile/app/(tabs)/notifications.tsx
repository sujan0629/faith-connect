import { ScrollView, View, RefreshControl, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useMemo, useEffect } from 'react'
import { useDebouncedRouter } from '../../hooks/useDebounce'
import { NotificationsHeader } from '../../components/Headers/NotificationsHeader'
import { NotificationSearchBar } from '../../components/Notifications/NotificationSearchBar'
import { NotificationsSkeleton } from '../../components/Skeletons/NotificationSkeleton'
import { useNotificationStore, Notification } from '../../stores/notificationStore'
import { NotificationMentionCard } from '../../components/Notifications/NotificationMentionCard'
import { NotificationLikeCard } from '../../components/Notifications/NotificationLikeCard'
import { NotificationEmptyState } from '../../components/Notifications/NotificationEmptyState'
import { FilterState } from '../../components/FilterDropdown'
import { useNetworkSync } from '../../hooks/useNetworkSync'
import { useHideTabOnScroll } from '../../hooks/useHideTabOnScroll'
import { cacheFeedForOffline, getCachedFeedForOffline } from '../../lib/caching'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { useOfflineStore } from '../../stores/offlineStore'

type TabType = 'All' | 'Mentions'

export default function NotificationsScreen() {
  const router = useDebouncedRouter()
  const { items, fetchNotifications, markRead, deleteNotification } = useNotificationStore()
  const [activeTab, setActiveTab] = useState<TabType>('All')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { isSyncing, syncError } = useOfflineStore()
  
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'Recent',
    type: 'All',
  })
  const [refreshing, setRefreshing] = useState(false)
  const { isOffline } = useNetworkSync()
  const onScroll = useHideTabOnScroll()

  // Fetch notifications on mount
   
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await fetchNotifications()
        // Cache notifications after successful fetch
        await cacheFeedForOffline('notifications', items)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        // Try to load from cache if network fails
        if (isOffline) {
          const cached = await getCachedFeedForOffline('notifications')
          if (cached) {
            Toast.show({ type: 'info', text1: 'Offline', text2: 'Showing cached notifications' })
          }
        }
      } finally {
        setLoading(false)
      }
    }
    loadNotifications()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchNotifications()
      // Cache notifications after successful fetch
      await cacheFeedForOffline('notifications', items)
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
      if (isOffline) {
        Toast.show({ type: 'info', text1: 'Offline', text2: 'Using cached notifications' })
      }
    } finally {
      setRefreshing(false)
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now.getTime() - notifDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return notifDate.toLocaleDateString()
  }

  const filteredNotifications = useMemo(() => {
    let filtered = items

    // Apply tab filter
    if (activeTab === 'Mentions') {
      // Show comments and replies
      filtered = filtered.filter((n) => n.type === 'comment' || n.type === 'reply' || n.type === 'mention')
    }

    // Apply type filter
    if (filters.type !== 'All') {
      if (filters.type === 'Mentions') filtered = filtered.filter((n) => ['comment', 'reply', 'mention'].includes(n.type))
      if (filters.type === 'Likes') filtered = filtered.filter((n) => n.type === 'like')
      if (filters.type === 'Comments') filtered = filtered.filter((n) => n.type === 'comment' || n.type === 'reply')
      if (filters.type === 'Reposts') filtered = filtered.filter((n) => n.type === 'repost')
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((n) =>
        n.actorName?.toLowerCase().includes(searchLower) ||
        n.content?.toLowerCase().includes(searchLower) ||
        n.replyingTo?.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting - Always sort by date (most recent first)
    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return filtered
  }, [items, activeTab, filters, search])

  const handleReply = async (id: string) => {
    // TODO: Implement reply logic
    console.log('Reply to notification:', id)
    await markRead(id)
  }

  const handleRepost = async (id: string) => {
    // TODO: Implement repost logic
    console.log('Repost notification:', id)
    await markRead(id)
  }

  const handleSave = async (id: string) => {
    // TODO: Implement save logic
    console.log('Save notification:', id)
    await markRead(id)
  }

  const handleShare = async (id: string) => {
    // TODO: Implement share logic
    console.log('Share notification:', id)
    await markRead(id)
  }

  const handleMenu = async (id: string) => {
    // TODO: Implement menu options (delete, mute, etc.)
    console.log('Menu for notification:', id)
    await deleteNotification(id)
  }

  const handleCardPress = async (notification: Notification) => {
    await markRead(notification.id)
    
    // Navigate to the post if postId exists
    if (notification.postId) {
      router.push(`/posts/${notification.postId}`)
    } else if (notification.actorId) {
      // Fallback: navigate to actor's profile if no post
      router.push(`/profile/${notification.actorId}`)
    }
  }

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
      <NotificationsHeader segment={activeTab} onSegmentChange={setActiveTab} filters={filters} onFiltersChange={setFilters} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} onScroll={onScroll} scrollEventThrottle={16} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        {/* Search Bar */}
        <View className="px-4">
          <NotificationSearchBar value={search} onChange={setSearch} />
        </View>

        {loading ? (
          <NotificationsSkeleton />
        ) : filteredNotifications.length === 0 ? (
          <View className="px-4">
            <NotificationEmptyState tab={activeTab.toLowerCase() as 'all' | 'mentions'} />
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <View key={notification.id}>
              {notification.type === 'like' ? (
                <NotificationLikeCard
                  id={notification.id}
                  authorId={notification.actorId}
                  authorName={notification.actorName}
                  authorAvatar={notification.actorAvatar || ''}
                  isVerified={notification.isVerified || false}
                  actionType={notification.actionType || 'post'}
                  timestamp={formatTimeAgo(notification.createdAt)}
                  onPress={() => handleCardPress(notification)}
                />
              ) : (
                <NotificationMentionCard
                  id={notification.id}
                  authorId={notification.actorId}
                  authorName={notification.actorName}
                  authorAvatar={notification.actorAvatar || ''}
                  isVerified={notification.isVerified || false}
                  comment={notification.content || ''}
                  replyingTo={notification.replyingTo}
                  timestamp={formatTimeAgo(notification.createdAt)}
                  onReply={() => handleReply(notification.id)}
                  onRepost={() => handleRepost(notification.id)}
                  onSave={() => handleSave(notification.id)}
                  onShare={() => handleShare(notification.id)}
                  onMenu={() => handleMenu(notification.id)}
                />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
