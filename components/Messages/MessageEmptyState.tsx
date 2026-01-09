import { View, Text } from 'react-native'

interface MessageEmptyStateProps {
  hasSearch: boolean
}

export const MessageEmptyState = ({ hasSearch }: MessageEmptyStateProps) => (
  <View className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4">
    <Text className="text-sm text-gray-600">
      {hasSearch ? 'No conversations found.' : 'No conversations yet. Start by following a leader.'}
    </Text>
  </View>
)
