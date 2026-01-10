import { View, Image, Pressable, Text, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ProfileGridItem {
  id: string
  thumbnail?: string
  mediaType?: 'image' | 'video' | 'reel'
  likesCount?: number
  commentsCount?: number
}

interface ProfileGridProps {
  items: ProfileGridItem[]
  onItemPress?: (id: string) => void
  isLeader?: boolean
}

const { width } = Dimensions.get('window')
const ITEM_SIZE = (width - 8) / 3 // 3 columns with 4px gaps (2px each side)

export const ProfileGrid = ({ items, onItemPress, isLeader = false }: ProfileGridProps) => {
  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Ionicons name="images-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-500 mt-4 text-sm">No posts yet</Text>
      </View>
    )
  }

  return (
    <View className="flex-row flex-wrap gap-[2px] bg-gray-100">
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onItemPress?.(item.id)}
          style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
          className={`bg-gray-200 relative ${isLeader ? 'border-2 border-yellow-400' : ''}`}
        >
          {item.thumbnail && (
            <Image
              source={{ uri: item.thumbnail }}
              style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
              className="bg-gray-200"
            />
          )}
          
          {/* Media Type Indicator */}
          {item.mediaType === 'video' && (
            <View className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
              <Ionicons name="play" size={16} color="white" />
            </View>
          )}
          {item.mediaType === 'reel' && (
            <View className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
              <Ionicons name="film" size={16} color="white" />
            </View>
          )}

          {/* Engagement Stats */}
          {(item.likesCount || item.commentsCount) && (
            <View className="absolute bottom-2 left-2 flex-row gap-2">
              {item.likesCount !== undefined && (
                <View className="flex-row items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                  <Ionicons name="heart" size={12} color="white" />
                  <Text className="text-white text-xs font-medium">
                    {item.likesCount >= 1000 ? `${(item.likesCount / 1000).toFixed(1)}K` : item.likesCount}
                  </Text>
                </View>
              )}
              {item.commentsCount !== undefined && (
                <View className="flex-row items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                  <Ionicons name="chatbubble" size={12} color="white" />
                  <Text className="text-white text-xs font-medium">
                    {item.commentsCount >= 1000 ? `${(item.commentsCount / 1000).toFixed(1)}K` : item.commentsCount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Pressable>
      ))}
    </View>
  )
}
