import { View, Text, Pressable, Image, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '../../stores/authStore'
import NotificationFilterDropdown from '../Notifications/NotificationFilterDropdown'
import { FilterState } from '../FilterDropdown'

const segments = ['All', 'Mentions'] as const
type Segment = (typeof segments)[number]

interface NotificationsHeaderProps {
  segment: Segment
  onSegmentChange: (segment: Segment) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export const NotificationsHeader = ({ segment, onSegmentChange, filters, onFiltersChange }: NotificationsHeaderProps) => {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  return (
    <View className="bg-white">
      <View className="flex-row items-center justify-between px-4 py-3">
        <NotificationFilterDropdown initialFilters={filters} onApply={onFiltersChange} />
        <Text className="text-[20px] font-bold text-[#111111]">
          Notifications
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

      <View className="mb-1 mt-4 flex-row gap-0 bg-gray-100 mx-4 rounded-full p-1">
        {segments.map((item) => (
          <Pressable
            key={item}
            onPress={() => onSegmentChange(item)}
            className={`flex-1 rounded-full px-6 py-2.5 relative overflow-hidden`}
          >
            {segment === item && (
              <LinearGradient
                colors={["#222222", "#111111"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
              />
            )}
            <Text className={`text-center text-sm font-semibold z-10 ${segment === item ? 'text-white' : 'text-gray-600'}`}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}