import { View, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface NotificationSearchBarProps {
  value: string
  onChange: (text: string) => void
}

export const NotificationSearchBar = ({ value, onChange }: NotificationSearchBarProps) => (
  <View className="mt-4 flex-row items-center rounded-xl bg-gray-100 px-4 py-3 mb-4">
    <Ionicons name="search" size={18} color="#9CA3AF" />
    <TextInput
      placeholder="Search notifications"
      value={value}
      onChangeText={onChange}
      className="ml-2 flex-1 text-sm"
      placeholderTextColor="#9CA3AF"
    />
  </View>
)