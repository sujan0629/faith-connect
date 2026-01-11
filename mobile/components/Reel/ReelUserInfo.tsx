import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'

interface Reel {
  id: string
  authorName: string
  authorAvatar?: string
  body: string
}

interface ReelUserInfoProps {
  reel: Reel
  onFollowPress?: (isFollowing: boolean) => void
}

export const ReelUserInfo = ({ reel, onFollowPress }: ReelUserInfoProps) => {
  const [isFollowing, setIsFollowing] = useState(false)

  const handleFollowPress = () => {
    setIsFollowing(!isFollowing)
    onFollowPress?.(!isFollowing)
  }

  return (
    <View className="absolute bottom-0 left-0 right-0 z-10">
      <View className="px-4 pb-4">
        <View className="flex-row items-center gap-3 mb-3">
          {reel.authorAvatar ? (
            <Image
              source={{ uri: reel.authorAvatar }}
              className="w-10 h-10 rounded-full bg-gray-700"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-700" />
          )}
          <View className="flex-row items-center gap-2">
            <Text className="text-white font-semibold text-base">{reel.authorName}</Text>
            <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
            <Pressable onPress={handleFollowPress} className={`rounded-lg px-4 py-1.5 ml-1 ${isFollowing ? 'bg-transparent border border-white' : 'bg-white'}`}>
              <Text className={`font-semibold text-xs ${isFollowing ? 'text-white' : 'text-black'}`}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text className="text-white mr-12 text-sm" numberOfLines={2}>
          {reel.body}
          <Text className="text-gray-200"> ...more</Text>
        </Text>
      </View>
    </View>
  )
}
