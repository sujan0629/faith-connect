import { View, Text } from 'react-native'

interface MessageEmptyStateProps {
  hasSearch: boolean
}

export const MessageEmptyState = ({ hasSearch }: MessageEmptyStateProps) => (
  <View className="mt-6 items-center p-4">
    <Text className="text-sm text-gray-600">
      {hasSearch ? 'No conversations found.' : 'No conversations yet. Start by following a leader.'}
    </Text>
  </View>
)
