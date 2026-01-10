import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

interface ProfileTopBarProps {
  username: string
  isOwnProfile?: boolean
  onMenuPress?: () => void
}

export const ProfileTopBar = ({ username, isOwnProfile = false, onMenuPress }: ProfileTopBarProps) => {
  const router = useRouter()

  return (
    <View className="bg-white border-b border-gray-100">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#111111" />
        </Pressable>
        
        {/* Centered Username - Absolute positioning */}
        <View className="absolute left-0 right-0 items-center pointer-events-none">
          <Text className="text-2xl font-bold text-gray-900">{username}</Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable onPress={onMenuPress} className="h-9 w-9 items-center justify-center">
            <Ionicons name="menu" size={24} color="#111111" />
          </Pressable>
        </View>
      </View>
    </View>
  )
}