import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Post } from '../../stores/feedStore'
import { Video, ResizeMode } from 'expo-av'

interface Props {
  item: Post
  onLike: (id: string) => void
  onSave: (id: string) => void
}

const formatCount = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export const ReelCard = ({ item, onLike, onSave }: Props) => {
  return (
    <View className="border-b border-[#f0f0f0] bg-white px-5 pb-5 pt-4">
      {/* Header */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2.5">
          {item.authorAvatar ? (
            <Image
              source={{ uri: item.authorAvatar }}
              className="h-8 w-8 rounded-full bg-gray-200"
            />
          ) : (
            <View className="h-8 w-8 rounded-full bg-gray-200" />
          )}
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-bold text-[#111111]">{item.authorName}</Text>
              <Ionicons name="checkmark-circle" size={14} color="#007AFF" />
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="musical-notes" size={10} color="#999999" />
              <Text className="text-xs text-[#999999]">{item.authorName} · Original audio</Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-[#999999]">1 hour ago</Text>
          <Text className="text-base font-bold text-[#999999]">•••</Text>
        </View>
      </View>

      {/* Video */}
      {item.mediaType === 'video' && item.media ? (
        <View className="mb-3">
          <View className="h-[620px] overflow-hidden rounded-xl bg-black">
            <Video
              source={{ uri: item.media }}
              style={{ width: '100%', height: '100%' }}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted={false}
              useNativeControls={false}
            />
          </View>
          {item.title && <Text className="mt-3 text-sm font-bold text-[#111111]">{item.title}</Text>}
          <Text className="mt-1 text-sm leading-5 text-[#666666]">{item.body}</Text>
        </View>
      ) : null}

      {/* Action Bar */}
      <View className="flex-row items-center justify-between">
        <Pressable className="flex-row items-center gap-2">
          <Ionicons name="chatbubble-outline" size={24} color="#666666" />
          <Text className="text-sm font-medium text-[#666666]">{formatCount(item.comments)}</Text>
        </Pressable>

        <Pressable className="flex-row items-center gap-2" onPress={() => onLike(item.id)}>
          <Ionicons
            name={item.isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={item.isLiked ? '#f472b6' : '#666666'}
          />
          <Text className="text-sm font-medium text-[#666666]">{formatCount(item.likes)}</Text>
        </Pressable>

        <Pressable
          className={`flex-row items-center gap-2 rounded-2xl px-5 py-2 ${
            item.isSaved ? 'bg-[#DCEBFF]' : ''
          }`}
          onPress={() => onSave(item.id)}
        >
          <Ionicons
            name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={item.isSaved ? '#007AFF' : '#666666'}
          />
          <Text className={`text-sm font-semibold ${item.isSaved ? 'text-[#007AFF]' : 'text-[#666666]'}`}>
            {formatCount(item.saves)}
          </Text>
        </Pressable>

        <Pressable className="flex-row items-center gap-2">
          <Ionicons name="repeat" size={24} color="#666666" />
          <Text className="text-sm font-medium text-[#666666]">82K</Text>
        </Pressable>
      </View>
    </View>
  )
}
