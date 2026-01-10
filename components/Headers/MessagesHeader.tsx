import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import MessageFilterDropdown from '../Messages/MessageFilterDropdown'
import { FilterState } from '../FilterDropdown'

interface MessagesHeaderProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export const MessagesHeader = ({ filters, onFiltersChange }: MessagesHeaderProps) => {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  return (
    <View className="bg-white">
      <View className="flex-row items-center justify-between px-4 py-3">
        <MessageFilterDropdown initialFilters={filters} onApply={onFiltersChange} />
        <Text className="text-[20px] font-bold text-[#111111]">
          Messages
        </Text>
        <Pressable 
          className="h-9 w-9 items-center justify-center"
          onPress={() => user?.id && router.push(`/profile/${user.id}` as any)}
        >
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww' }}
            className="h-9 w-9 rounded-full bg-gray-200"
          />
        </Pressable>
      </View>
    </View>
  )
}