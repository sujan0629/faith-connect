import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

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
      <View className="border-b border-[#f0f0f0] bg-white px-5 pb-5 pt-4">
        {/* Header */}
        <View className="mb-2 flex-row items-center justify-between">
          {/* Love icon on left */}
          <Ionicons name="heart" size={20} color="#f472b6" />

          {/* Avatar */}
          <View className="flex-1 flex-row items-center gap-2.5 px-2.5">
            <Image
              source={{ uri: authorAvatar }}
              className="h-8 w-8 rounded-full bg-gray-200"
            />
          </View>

          {/* Timestamp */}
          <Text className="text-xs text-[#999999]">{timestamp}</Text>
        </View>

        {/* Author name and action text below avatar */}
        <View className="flex-row items-baseline ml-9">
          <Text className="text-base font-bold text-[#111111]">{authorName}</Text>
          <Text className="text-sm text-[#666666] ml-1">{getActionText()}</Text>
        </View>
      </View>
    </Pressable>
  )
}
