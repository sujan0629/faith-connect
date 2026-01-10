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
  followersCount: number
  followingCount: number
  onPostsPress?: () => void
  onFollowersPress?: () => void
  onFollowingPress?: () => void
  onEditProfile?: () => void
  onShareProfile?: () => void
  onContact?: () => void
  onFollow?: () => void
  onMessage?: () => void
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
  followersCount,
  followingCount,
  onPostsPress,
  onFollowersPress,
  onFollowingPress,
  onEditProfile,
  onShareProfile,
  onContact,
  onFollow,
  onMessage,
}: ProfileHeaderProps) => {
  return (
    <View className="bg-white px-4 py-6">
      {/* Avatar - Centered */}
      <View className="items-center">
        <View className={`${isLeader ? 'border-4 border-yellow-400' : ''} rounded-full`}>
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
            <Text className={`text-xl font-bold ${isLeader ? 'text-yellow-600' : 'text-gray-900'}`}>{name}</Text>
            {isVerified && (
              <Ionicons name="checkmark-circle" size={20} color={isLeader ? '#FBBF24' : '#3B82F6'} />
            )}
          </View>
          {faith && (
            <View className="mt-2 flex-row items-center gap-2 justify-center">
              <Text className="text-sm text-gray-600 font-medium">{faith}</Text>
              <Text className={`text-sm font-medium ${isLeader ? 'text-yellow-600' : 'text-gray-500'}`}>
                • {isLeader ? 'Leader' : 'Worshipper'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats Grid - 3 Columns with Separators */}
      <View className="flex-row items-center justify-center mt-5 mb-3">
        {/* Posts */}
        <Pressable onPress={onPostsPress} className="flex-1 items-center border-r border-gray-200 pr-2">
          <Text className="text-base font-bold text-gray-900">
            {formatCount(postsCount)}
          </Text>
          <Text className="text-[11px] text-gray-600 mt-0.5">Posts</Text>
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

      {/* Action Buttons */}
      <View className="flex-row justify-center gap-3 mt-4">
        {isOwnProfile ? (
          <>
            <Pressable onPress={onEditProfile} className="bg-gray-100 px-4 py-2 rounded-lg">
              <Text className="text-sm font-semibold text-gray-900">Edit Profile</Text>
            </Pressable>
            <Pressable onPress={onShareProfile} className="bg-gray-100 px-4 py-2 rounded-lg">
              <Text className="text-sm font-semibold text-gray-900">Share Profile</Text>
            </Pressable>
            <Pressable onPress={onContact} className="bg-gray-100 px-4 py-2 rounded-lg">
              <Text className="text-sm font-semibold text-gray-900">Contact</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable onPress={onFollow} className={`${isLeader ? 'bg-yellow-400' : 'bg-blue-500'} px-4 py-2 rounded-lg`}>
              <Text className={`text-sm font-semibold ${isLeader ? 'text-yellow-900' : 'text-white'}`}>Follow</Text>
            </Pressable>
            <Pressable onPress={onMessage} className="bg-gray-100 px-4 py-2 rounded-lg">
              <Text className="text-sm font-semibold text-gray-900">Message</Text>
            </Pressable>
            <Pressable onPress={onShareProfile} className="bg-gray-100 px-4 py-2 rounded-lg">
              <Text className="text-sm font-semibold text-gray-900">Share Profile</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  )
}
