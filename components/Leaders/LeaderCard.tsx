import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SolidButton } from '../Buttons/SolidButton'
import { Leader } from '../../stores/leaderStore'

interface Props {
  item: Leader
  onToggleFollow: (leaderId: string, willFollow: boolean) => void
  onOpenProfile?: (leaderId: string) => void
}

export const LeaderCard = ({ item, onToggleFollow, onOpenProfile }: Props) => (
  <Pressable
    onPress={() => onOpenProfile?.(item.id)}
    className="bg-white p-4"
  >
    <View className="flex-row gap-3 border-b border-gray-100 pb-6">
      <Image
        source={{ uri: item.avatar || 'https://plus.unsplash.com/premium_photo-1665461700374-eb5ab60f4ffe?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
        className="w-20 h-20 rounded-full bg-gray-200"
      />
      <View className="flex-1 justify-between3">
        <View>
          <View className="flex-row items-center mt-2 gap-1">
            <Text className="text-base font-bold text-gray-900">{item.name}</Text>
          </View>
          <Text className="text-sm text-gray-500 font-medium mt-1">{item.faith}</Text>
          <Text className="text-xs text-gray-600 mt-2">{item.bio}</Text>
        </View>
        <View className="self-start mt-2">
          <SolidButton
            label={item.isFollowed ? 'Following' : 'Follow'}
            onPress={() => onToggleFollow(item.id, !item.isFollowed)}
            variant={item.isFollowed ? 'secondary' : 'primary'}
            style={{ marginTop: 8, paddingVertical: 8 }}
          />
        </View>
      </View>
    </View>
  </Pressable>
)
