import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useFollowStore } from '../../stores/followStore'
import { useAuthStore } from '../../stores/authStore'
import { leadersApi } from '../../api/leaders'
import Toast from 'react-native-toast-message'

interface Reel {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  body: string
}

interface ReelUserInfoProps {
  reel: Reel
  onFollowPress?: (isFollowing: boolean) => void
}

export const ReelUserInfo = ({ reel, onFollowPress }: ReelUserInfoProps) => {
  const router = useRouter()
  const { isFollowing: checkFollowing, addFollowing, removeFollowing } = useFollowStore()
  const following = checkFollowing(reel.authorId)
  const [loading, setLoading] = useState(false)
  const user = useAuthStore((s) => s.user)

  const handleFollowPress = async () => {
    try {
      setLoading(true)
      if (following) {
        await leadersApi.unfollowLeader(reel.authorId)
        removeFollowing(reel.authorId)
        Toast.show({
          type: 'success',
          text1: 'Unfollowed',
          text2: `You unfollowed ${reel.authorName}`,
        })
      } else {
        await leadersApi.followLeader(reel.authorId)
        addFollowing(reel.authorId)
        Toast.show({
          type: 'success',
          text1: 'Following',
          text2: `You are now following ${reel.authorName}`,
        })
      }
      onFollowPress?.(!following)
    } catch (error: any) {
      console.error('Follow error:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to update follow status',
        text2: error?.response?.data?.message || 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="absolute bottom-20 left-0 right-0 z-10">
      <View className="px-4 pb-4">
        <View className="flex-row items-center gap-3 mb-3">
          <Pressable onPress={() => router.push(`/profile/${reel.authorId}`)}>
            {reel.authorAvatar ? (
              <Image
                source={{ uri: reel.authorAvatar }}
                className="w-10 h-10 rounded-full bg-gray-700"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-gray-700" />
            )}
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => router.push(`/profile/${reel.authorId}`)}>
              <Text className="text-white font-semibold text-base">{reel.authorName}</Text>
            </Pressable>
            <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
            {(!user || user.id !== reel.authorId) && (
              <Pressable onPress={handleFollowPress} disabled={loading} className={`rounded-lg px-4 py-1.5 ml-1 ${following ? 'bg-transparent border border-white' : 'bg-white'}`}>
                <Text className={`font-semibold text-xs ${following ? 'text-white' : 'text-black'}`}>
                  {following ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            )}
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
