import { View, Text, Image, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ProfileHeaderProps {
  name: string
  username?: string
  avatar?: string
  faith?: string
  role?: string
  isVerified?: boolean
  isOwnProfile?: boolean
  isLeader?: boolean
  postsCount: number
  repostsCount?: number
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

export const ProfileHeader = ({
  name,
  username,
  avatar,
  faith,
  role,
  isVerified = false,
  isOwnProfile = false,
  isLeader = false,
  postsCount,
  repostsCount = 0,
  followersCount,
  followingCount,
  onPostsPress,
  onFollowersPress,
  onFollowingPress,
}: ProfileHeaderProps) => {
  const isWorshiper = role === 'worshiper'
  const contentCount = isWorshiper ? repostsCount : postsCount
  const contentLabel = isWorshiper ? 'Reposts' : 'Posts'

  return (
    <View className="bg-white px-4 py-6">
      {/* Avatar - Centered */}
      <View className="items-center">
        <View className={`rounded-full`}>
          <Image
            source={{
              uri: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww'
            }}
            className="h-24 w-24 rounded-full bg-gray-200"
          />
        </View>

        {/* Name & Username - Centered */}
        <View className="items-center mt-3">
          <View className="flex-row items-center gap-1.5">
            <Text className={`text-xl font-bold ${isLeader ? 'text-gray-900' : 'text-gray-900'}`}>{name}</Text>
            {isVerified && (
              <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
            )}
          </View>
          {faith && (
            <View className="mt-2 flex-row items-center gap-2 justify-center">
              <Text className="text-sm text-gray-600 font-medium">{faith}</Text>
              <Text className={`text-sm font-medium ${isLeader ? 'text-gray-600' : 'text-gray-500'}`}>
                • {isLeader ? 'Leader' : 'Worshipper'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats Grid - 3 Columns with Separators */}
      <View className="flex-row items-center justify-center mt-5 mb-3">
        {/* Posts/Reposts */}
        <Pressable onPress={onPostsPress} className="flex-1 items-center border-r border-gray-200 pr-2">
          <Text className="text-base font-bold text-gray-900">
            {formatCount(contentCount)}
          </Text>
          <Text className="text-[11px] text-gray-600 mt-0.5">{contentLabel}</Text>
        </Pressable>

        {/* Followers */}
        <Pressable onPress={onFollowersPress} className="flex-1 items-center border-r border-gray-200 px-2">
          <Text className="text-base font-bold text-gray-900">
            {formatCount(followersCount)}
          </Text>
          <Text className="text-[11px] text-gray-600 mt-0.5">Followers</Text>
        </Pressable>

        {/* Following */}
        <Pressable onPress={onFollowingPress} className="flex-1 items-center pl-2">
          <Text className="text-base font-bold text-gray-900">
            {formatCount(followingCount)}
          </Text>
          <Text className="text-[11px] text-gray-600 mt-0.5">Following</Text>
        </Pressable>
      </View>
    </View>
  )
}
