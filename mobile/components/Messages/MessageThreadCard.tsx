import { View, Text, Pressable, Image } from 'react-native'

interface MessageThreadCardProps {
  id: string
  peerName: string
  lastMessage: string
  avatar?: string
  isActive: boolean
  unread: number
  timestamp: Date
  onPress: () => void
}

const getTimeAgo = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(date).toLocaleDateString()
}

export const MessageThreadCard = ({
  id,
  peerName,
  lastMessage,
  avatar,
  isActive,
  unread,
  timestamp,
  onPress,
}: MessageThreadCardProps) => (
  <Pressable
    key={id}
    onPress={onPress}
    className={`mb-2  border-b border-gray-100 flex-row items-center gap-3 rounded-2xl p-4 ${
      unread > 0 ? 'bg-blue-50' : 'bg-white'
    }`}
  >
    {/* Avatar with Status Dot */}
    <View className="relative">
      <Image
        source={{
          uri:
            avatar ||
            'https://plus.unsplash.com/premium_photo-1665461700374-eb5ab60f4ffe?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        }}
        className="w-16 h-16 rounded-full bg-gray-200"
      />
      <View
        className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
          isActive ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
    </View>

    {/* Content */}
    <View className="flex-1">
      <Text className="text-base font-bold text-gray-900">{peerName}</Text>
      <Text className="mt-1 text-sm text-gray-600 line-clamp-1">{lastMessage}</Text>
    </View>

    {/* Time and Unread */}
    <View className="items-end gap-2">
      <Text className="text-xs text-gray-500 font-medium">{getTimeAgo(timestamp)}</Text>
      {unread > 0 ? (
        <View className="rounded-full bg-blue-500 w-6 h-6 items-center justify-center">
          <Text className="text-xs font-semibold text-white">{unread > 9 ? '9+' : unread}</Text>
        </View>
      ) : null}
    </View>
  </Pressable>
)
