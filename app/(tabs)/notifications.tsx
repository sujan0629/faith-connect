import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useMemo } from 'react'
import { NotificationsHeader } from '../../components/Headers/NotificationsHeader'
import { useNotificationStore, Notification } from '../../stores/notificationStore'
import { NotificationMentionCard } from '../../components/Notifications/NotificationMentionCard'
import { NotificationLikeCard } from '../../components/Notifications/NotificationLikeCard'
import { NotificationEmptyState } from '../../components/Notifications/NotificationEmptyState'
import { FilterState } from '../../components/FilterDropdown'

type TabType = 'All' | 'Mentions'

export default function NotificationsScreen() {
  const { items, markRead } = useNotificationStore()
  const [activeTab, setActiveTab] = useState<TabType>('All')
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'Recent',
    type: 'All',
  })

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
    if (activeTab === 'All') {
      const likes = filtered.filter((n) => n.type === 'like')
      const others = filtered.filter((n) => n.type !== 'like')
      filtered = [...others, ...likes]
    }
    if (activeTab === 'Mentions') filtered = filtered.filter((n) => n.type === 'mention')

    // Apply type filter
    if (filters.type !== 'All') {
      if (filters.type === 'Mentions') filtered = filtered.filter((n) => n.type === 'mention')
      if (filters.type === 'Likes') filtered = filtered.filter((n) => n.type === 'like')
      if (filters.type === 'Comments') filtered = filtered.filter((n) => n.type === 'comment')
    }

    // Apply sorting
    if (filters.sortBy === 'Type') {
      filtered = filtered.sort((a, b) => a.type.localeCompare(b.type))
    } else {
      // Recent - sort by date (assuming newer items have higher index or we can sort by createdAt)
      filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
  }, [items, activeTab, filters])

  const handleReply = (id: string) => {
    // TODO: Implement reply logic
    console.log('Reply to notification:', id)
  }

  const handleRepost = (id: string) => {
    // TODO: Implement repost logic
    console.log('Repost notification:', id)
  }

  const handleSave = (id: string) => {
    // TODO: Implement save logic
    console.log('Save notification:', id)
  }

  const handleShare = (id: string) => {
    // TODO: Implement share logic
    console.log('Share notification:', id)
  }

  const handleMenu = (id: string) => {
    // TODO: Implement menu options (delete, mute, etc.)
    console.log('Menu for notification:', id)
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <NotificationsHeader segment={activeTab} onSegmentChange={setActiveTab} filters={filters} onFiltersChange={setFilters} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
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
                  authorId={notification.authorId}
                  authorName={notification.authorName}
                  authorAvatar={notification.authorAvatar}
                  isVerified={notification.isVerified}
                  actionType={notification.actionType}
                  timestamp={formatTimeAgo(notification.createdAt)}
                  onPress={() => markRead(notification.id)}
                />
              ) : (
                <NotificationMentionCard
                  id={notification.id}
                  authorId={notification.authorId}
                  authorName={notification.authorName}
                  authorAvatar={notification.authorAvatar}
                  isVerified={notification.isVerified}
                  comment={notification.comment}
                  replyingTo={notification.replyingTo}
                  timestamp={formatTimeAgo(notification.createdAt)}
                  onReply={handleReply}
                  onRepost={handleRepost}
                  onSave={handleSave}
                  onShare={handleShare}
                  onMenu={handleMenu}
                />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
