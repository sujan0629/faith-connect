import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Reel {
  id: string
  likes: number
  isLiked?: boolean
  comments: number
  saves: number
  isSaved?: boolean
}

interface ReelActionsProps {
  reel: Reel
  onLikePress: (reelId: string) => void
  onSavePress: (reelId: string) => void
  onCommentPress?: () => void
  onSharePress?: () => void
  onMorePress?: () => void
}

const formatCount = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export const ReelActions = ({
  reel,
  onLikePress,
  onSavePress,
  onCommentPress,
  onSharePress,
  onMorePress,
}: ReelActionsProps) => {
  return (
    <View className="absolute right-4 bottom-0 gap-6 items-center">
      {/* Like Button */}
      <Pressable onPress={() => onLikePress(reel.id)} className="items-center">
        <Ionicons
          name={reel.isLiked ? 'heart' : 'heart-outline'}
          size={32}
          color={reel.isLiked ? '#FF3B5C' : 'white'}
        />
        <Text className="text-white text-xs font-semibold mt-1">{formatCount(reel.likes)}</Text>
      </Pressable>

      {/* Comment Button */}
      <Pressable onPress={onCommentPress} className="items-center">
        <Ionicons name="chatbubble-outline" size={30} color="white" />
        <Text className="text-white text-xs font-semibold mt-1">{formatCount(reel.comments)}</Text>
      </Pressable>

      {/* Save Button */}
      <Pressable onPress={() => onSavePress(reel.id)} className="items-center">
        <Ionicons
          name={reel.isSaved ? 'bookmark' : 'bookmark-outline'}
          size={30}
          color="white"
        />
        <Text className="text-white text-xs font-semibold mt-1">{formatCount(reel.saves)}</Text>
      </Pressable>

      {/* Share Button */}
      <Pressable onPress={onSharePress} className="items-center">
        <Ionicons name="repeat" size={30} color="white" />
        <Text className="text-white text-xs font-semibold mt-1">7000</Text>
      </Pressable>

      {/* More Options */}
      <Pressable onPress={onMorePress} className="items-center">
        <Ionicons name="ellipsis-horizontal" size={30} color="white" />
      </Pressable>
    </View>
  )
}
