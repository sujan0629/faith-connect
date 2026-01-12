import { View, Text, Pressable } from 'react-native'
import { Octicons } from '@expo/vector-icons'

interface CreatePostCTAProps {
  onPress: () => void
}

export const CreatePostCTA = ({ onPress }: CreatePostCTAProps) => {
  return (
    <View key="create-post-section" className="mx-4 mb-6 mt-3 rounded-2xl bg-gray-50 p-4">
      <Text className="text-base font-medium text-gray-900">
        Post your first update today
      </Text>
      <Text className="text-sm text-gray-600 mt-1 mb-3">
        Share your thoughts by posting your first update
      </Text>

      <Pressable
        onPress={onPress}
        className="self-start rounded-xl bg-blue-500 px-4 py-2.5 flex-row items-center gap-2"
      >
        <Octicons name="sparkle-fill" size={16} color="white" />
        <Text className="text-sm font-semibold text-white">Create post</Text>
      </Pressable>
    </View>
  )
}
