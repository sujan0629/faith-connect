import { View, Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ProfileActionsProps {
  isFollowing?: boolean
  onFollowPress?: () => void
  onMessagePress?: () => void
  onMorePress?: () => void
  isOwnProfile?: boolean
  isLeader?: boolean
}

export const ProfileActions = ({
  isFollowing = false,
  onFollowPress,
  onMessagePress,
  onMorePress,
  isOwnProfile = false,
  isLeader = false,
}: ProfileActionsProps) => {
  if (isOwnProfile) {
    return null
  }

  return (
    <View className="bg-white px-4 py-3 border-t border-gray-100">
      <View className="flex-row gap-2">
        {/* Follow/Following Button */}
        <Pressable
          onPress={onFollowPress}
          className={`flex-1 py-2.5 rounded-full items-center ${
            isFollowing ? 'bg-gray-100' : isLeader ? 'bg-yellow-400' : 'bg-blue-500'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              isFollowing ? 'text-gray-900' : isLeader ? 'text-yellow-900' : 'text-white'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </Pressable>

        {/* Message Button */}
        <Pressable
          onPress={onMessagePress}
          className="flex-1 py-2.5 rounded-full items-center bg-gray-100"
        >
          <Text className="text-sm font-semibold text-gray-900">Message</Text>
        </Pressable>

        {/* More Options */}
        <Pressable
          onPress={onMorePress}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#111111" />
        </Pressable>
      </View>
    </View>
  )
}
