import { ScrollView, View, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { NotificationsHeader } from '../../components/Headers/NotificationsHeader'
import { useNotificationStore, Notification } from '../../stores/notificationStore'
import { NotificationMentionCard } from '../../components/Notifications/NotificationMentionCard'
import { NotificationLikeCard } from '../../components/Notifications/NotificationLikeCard'
import { NotificationEmptyState } from '../../components/Notifications/NotificationEmptyState'
import { FilterState } from '../../components/FilterDropdown'

type TabType = 'All' | 'Mentions'

export default function NotificationsScreen() {
  const router = useRouter()
  const { items, loading, fetchNotifications, markRead, markAllAsRead, deleteNotification } = useNotificationStore()
  const [activeTab, setActiveTab] = useState<TabType>('All')
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'Recent',
    type: 'All',
  })
  const [refreshing, setRefreshing] = useState(false)

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchNotifications()
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

    // Apply sorting - Always sort by date (most recent first)
    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return filtered
  }, [items, activeTab, filters])

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
      <NotificationsHeader segment={activeTab} onSegmentChange={setActiveTab} filters={filters} onFiltersChange={setFilters} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        {filteredNotifications.length === 0 ? (
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
