import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Post } from '../../stores/feedStore'
import { VideoView, useVideoPlayer } from 'expo-video'
import { useState } from 'react'
import { useRouter } from 'expo-router'

interface Props {
  item: Post
  onLike: (id: string) => void
  onSave: (id: string) => void
  isVisible?: boolean
}

const formatCount = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export const PostCard = ({ item, onLike, onSave, isVisible = false }: Props) => {
  const [paused, setPaused] = useState(true)
  const router = useRouter()

  const player = useVideoPlayer(item.media || '', player => {
    player.loop = true
    player.muted = true
    if (isVisible && item.mediaType === 'video') {
      player.play()
    } else {
      player.pause()
    }
  })

  const handlePress = () => {
    router.push(`/posts/${item.id}` as any)
  }

  return (
    <Pressable onPress={handlePress}>
      <View className="border-b border-[#f0f0f0] bg-white px-5 pb-5 pt-4">
      {/* Header */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2.5">
          {/* Avatar */}
          {item.authorAvatar ? (
            <Image
              source={{ uri: item.authorAvatar }}
              className="h-8 w-8 rounded-full bg-gray-200"
            />
          ) : (
            <View className="h-8 w-8 rounded-full bg-gray-200" />
          )}
          <View className="flex-1">
            <Text className="text-base font-bold text-[#111111]">{item.authorName}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-[#999999]">1 hour ago</Text>
          <Text className="text-base font-bold text-[#999999]">•••</Text>
        </View>
      </View>

      {/* Post Text */}
      {item.mediaType !== 'video' && <Text className="mb-3 text-sm leading-5 text-[#666666]">{item.body}</Text>}

      {/* Video Card */}
      {item.mediaType === 'video' && item.media ? (
        <View className="mb-3">
          <View className="h-[190px] overflow-hidden rounded-xl bg-black">
            <VideoView
              player={player}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              allowsPictureInPicture={false}
              pointerEvents="none"
            />
          </View>
          <Text className="mt-3 text-sm font-bold text-[#111111]">{item.title}</Text>
          <Text className="mt-1 text-sm leading-5 text-[#666666]">{item.body}</Text>
        </View>
      ) : null}

      {/* Image Card */}
      {item.mediaType === 'image' && item.media ? (
        <View className="mb-3 h-[250px] overflow-hidden rounded-xl bg-gray-100">
          <Image
            source={{ uri: item.media }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>
      ) : null}

      {/* Action Bar */}
      <View className="flex-row items-center justify-between">
        <Pressable 
          className="flex-row items-center gap-2"
          onPress={(e) => {
            e.stopPropagation()
            handlePress()
          }}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#666666" />
          <Text className="text-sm font-medium text-[#666666]">{formatCount(item.comments)}</Text>
        </Pressable>

        <Pressable 
          className="flex-row items-center gap-2" 
          onPress={(e) => {
            e.stopPropagation()
            onLike(item.id)
          }}
        >
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
          onPress={(e) => {
            e.stopPropagation()
            onSave(item.id)
          }}
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

        <Pressable 
          className="flex-row items-center gap-2"
          onPress={(e) => e.stopPropagation()}
        >
          <Ionicons name="repeat" size={24} color="#666666" />
          <Text className="text-sm font-medium text-[#666666]">82K</Text>
        </Pressable>
      </View>
    </View>
    </Pressable>
  )
}
