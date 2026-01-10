import { View, Text } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

interface NotificationEmptyStateProps {
  tab: 'all' | 'mentions'
}

export const NotificationEmptyState = ({ tab }: NotificationEmptyStateProps) => {
  const getEmptyMessage = () => {
    switch (tab) {
      case 'mentions':
        return 'No mentions yet'
      default:
        return 'No notifications yet'
    }
  }

  return (
    <View className="mt-8 items-center justify-center">
      <MaterialIcons name="notifications-none" size={48} color="#d1d5db" />
      <Text className="mt-4 text-center text-sm text-gray-600">{getEmptyMessage()}</Text>
      <Text className="mt-1 text-center text-xs text-gray-500">
        Stay engaged to receive notifications
      </Text>
    </View>
  )
}
