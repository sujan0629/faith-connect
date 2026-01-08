import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Leader } from '../../stores/leaderStore'

interface Props {
  item: Leader
  onToggleFollow: (leaderId: string, willFollow: boolean) => void
  onOpenProfile?: (leaderId: string) => void
}

export const LeaderCard = ({ item, onToggleFollow, onOpenProfile }: Props) => (
  <Pressable
    onPress={() => onOpenProfile?.(item.id)}
    className="mb-3 rounded-2xl border border-gray-200 bg-white p-4"
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
        <Text className="text-xs text-blue-600 font-medium">{item.faith}</Text>
        <Text className="mt-1 text-sm text-gray-600">{item.bio}</Text>
      </View>
      <Pressable
        onPress={() => onToggleFollow(item.id, !item.isFollowed)}
        className={`rounded-full px-3 py-2 ${item.isFollowed ? 'bg-gray-100' : 'bg-blue-500'}`}
      >
        <Text className={`text-sm font-semibold ${item.isFollowed ? 'text-gray-700' : 'text-white'}`}>
          {item.isFollowed ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </View>
  </Pressable>
)
