import { ScrollView, View, Toast } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useMemo } from 'react'
import { TopBar } from '../../components/Headers/TopBar'
import { useNotificationStore, Notification } from '../../stores/notificationStore'
import { NotificationMentionCard } from '../../components/Notifications/NotificationMentionCard'
import { NotificationLikeCard } from '../../components/Notifications/NotificationLikeCard'
import { NotificationTabs } from '../../components/Notifications/NotificationTabs'
import { NotificationEmptyState } from '../../components/Notifications/NotificationEmptyState'

type TabType = 'all' | 'mentions' | 'comments'

export default function NotificationsScreen() {
  const { items, markRead } = useNotificationStore()
  const [activeTab, setActiveTab] = useState<TabType>('all')

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
    if (activeTab === 'all') return items
    if (activeTab === 'mentions') return items.filter((n) => n.type === 'mention')
    if (activeTab === 'comments') return items.filter((n) => n.type === 'comment' || n.type === 'like')
    return items
  }, [items, activeTab])

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
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 py-4">
          <TopBar title="Notifications" subtitle="Activity from leaders" />
        </View>

        <NotificationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {filteredNotifications.length === 0 ? (
          <View className="px-4">
            <NotificationEmptyState tab={activeTab} />
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
                  faith={notification.faith}
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
