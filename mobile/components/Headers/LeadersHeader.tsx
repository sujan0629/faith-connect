import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import LeaderSortDropdown from '../Leaders/LeaderSortDropdown'
import { FilterState } from '../FilterDropdown'

const worshiperSegments = ['My Leaders', 'Explore'] as const
const leaderSegments = ['Recent', 'All Followers'] as const
type WorkshiperSegment = (typeof worshiperSegments)[number]
type LeaderSegment = (typeof leaderSegments)[number]
type Segment = WorkshiperSegment | LeaderSegment

interface LeadersHeaderProps {
  segment: Segment
  onSegmentChange: (segment: Segment) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  isLeader?: boolean
}

export const LeadersHeader = ({ segment, onSegmentChange, filters, onFiltersChange, isLeader = false }: LeadersHeaderProps) => {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  return (
    <View className="bg-white">
      <View className="flex-row items-center justify-between px-4 py-3">
        <LeaderSortDropdown initialFilters={filters} onApply={onFiltersChange} />
        <Text className="text-[20px] font-bold text-[#111111]">
          {isLeader ? 'Followers' : 'Leaders'}
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

      <View className="mb-4 mt-4 flex-row gap-0 bg-gray-100 mx-4 rounded-full p-1">
        {(isLeader ? leaderSegments : worshiperSegments).map((item) => (
          <Pressable
            key={item}
            onPress={() => onSegmentChange(item)}
            className={`flex-1 rounded-full px-6 py-2.5 ${segment === item ? 'bg-[#111]' : 'bg-transparent'}`}
          >
            <Text className={`text-center text-sm font-semibold ${segment === item ? 'text-white' : 'text-gray-600'}`}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}