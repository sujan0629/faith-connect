import { View, Text, Pressable } from 'react-native'

interface ProfileStatsProps {
  postsCount: number
  followersCount: number
  followingCount: number
  onPostsPress?: () => void
  onFollowersPress?: () => void
  onFollowingPress?: () => void
}

const formatCount = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export const ProfileStats = ({
  postsCount,
  followersCount,
  followingCount,
  onPostsPress,
  onFollowersPress,
  onFollowingPress,
}: ProfileStatsProps) => {
  return (
    <View className="bg-white border-y border-gray-100 px-4 py-4">
      <View className="flex-row justify-around">
        {/* Posts */}
        <Pressable onPress={onPostsPress} className="items-center flex-1">
          <Text className="text-xl font-bold text-gray-900">
            {formatCount(postsCount)}
          </Text>
          <Text className="text-sm text-gray-600 mt-0.5">Posts</Text>
        </Pressable>

        {/* Followers */}
        <Pressable onPress={onFollowersPress} className="items-center flex-1">
          <Text className="text-xl font-bold text-gray-900">
            {formatCount(followersCount)}
          </Text>
          <Text className="text-sm text-gray-600 mt-0.5">Followers</Text>
        </Pressable>

        {/* Following */}
        <Pressable onPress={onFollowingPress} className="items-center flex-1">
          <Text className="text-xl font-bold text-gray-900">
            {formatCount(followingCount)}
          </Text>
          <Text className="text-sm text-gray-600 mt-0.5">Following</Text>
        </Pressable>
      </View>
    </View>
  )
}
