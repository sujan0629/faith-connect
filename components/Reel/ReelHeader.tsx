import { View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'

interface ReelHeaderProps {
  onBack: () => void
  onCameraPress?: () => void
  onCreateReelPress?: () => void
}

export const ReelHeader = ({ onBack, onCameraPress, onCreateReelPress }: ReelHeaderProps) => {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isLeader = user?.role === 'leader'

  const handleRightIconPress = () => {
    if (isLeader) {
      // Leaders can create reels
      onCreateReelPress?.()
    } else {
      // Worshippers go to their profile
      router.push({
        pathname: '/profile/[id]',
        params: { id: user?.id }
      } as any)
    }
  }

  return (
    <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-10">
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable onPress={onBack} className="p-2">
          <Ionicons name="chevron-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-2xl font-semibold">Reels</Text>
        <Pressable onPress={handleRightIconPress} className="p-2">
          <Ionicons 
            name={isLeader ? "add-circle-outline" : "person-circle-outline"} 
            size={28} 
            color="white" 
          />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
