import { View, Text, Pressable, Image } from 'react-native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'

interface NotificationLikeCardProps {
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  isVerified: boolean
  actionType: 'post' | 'comment' | 'reply'
  timestamp: string
  onPress?: (id: string) => void
}

export const NotificationLikeCard = ({
  id,
  authorId,
  authorName,
  authorAvatar,
  isVerified,
  actionType,
  timestamp,
  onPress,
}: NotificationLikeCardProps) => {
  const getActionText = () => {
    switch (actionType) {
      case 'post':
        return 'liked your post'
      case 'comment':
        return 'liked your comment'
      case 'reply':
        return 'liked your reply'
      default:
        return 'liked your content'
    }
  }

  return (
    <Pressable onPress={() => onPress?.(id)}>
      <View className="border-b border-[#f0f0f0] bg-white px-4 py-3">
        {/* Header */}
        <View className="mb-3 flex-row items-center justify-between">
          {/* Love icon on left */}
          <View className="h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <MaterialIcons name="favorite" size={18} color="#ef4444" />
          </View>

          {/* Author info */}
          <View className="flex-1 flex-row items-center gap-2 px-3">
            <Image
              source={{ uri: authorAvatar }}
              className="h-8 w-8 rounded-full bg-gray-200"
            />

            <View className="flex-1">
              <View className="flex-row items-center gap-1">
                <Text className="font-semibold text-gray-900">{authorName}</Text>
                {isVerified && <MaterialIcons name="verified" size={12} color="#3b82f6" />}
              </View>
              <Text className="text-xs text-gray-500">@{authorId}</Text>
            </View>
          </View>

          {/* Timestamp */}
          <Text className="text-xs text-gray-400">{timestamp}</Text>
        </View>

        {/* Action text */}
        <View className="pl-16">
          <Text className="text-sm text-gray-700">{getActionText()}</Text>
        </View>
      </View>
    </Pressable>
  )
}
