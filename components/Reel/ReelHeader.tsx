import { View, Text, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

interface ReelHeaderProps {
  onBack: () => void
  onCameraPress?: () => void
}

export const ReelHeader = ({ onBack, onCameraPress }: ReelHeaderProps) => {
  return (
    <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-10">
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable onPress={onBack} className="p-2">
          <Ionicons name="chevron-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-2xl font-semibold">Reels</Text>
        <Pressable onPress={onCameraPress} className="p-2">
          <Ionicons name="camera-outline" size={28} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
