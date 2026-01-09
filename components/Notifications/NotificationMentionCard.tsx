import { View, Text, Pressable, Image } from 'react-native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useState } from 'react'

interface NotificationMentionCardProps {
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  isVerified: boolean
  faith: string
  comment: string
  replyingTo?: string
  timestamp: string
  onReply: (id: string) => void
  onRepost: (id: string) => void
  onSave: (id: string) => void
  onShare: (id: string) => void
  onMenu: (id: string) => void
}

export const NotificationMentionCard = ({
  id,
  authorId,
  authorName,
  authorAvatar,
  isVerified,
  faith,
  comment,
  replyingTo,
  timestamp,
  onReply,
  onRepost,
  onSave,
  onShare,
  onMenu,
}: NotificationMentionCardProps) => {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <View className="border-b border-[#f0f0f0] bg-white px-4 py-3">
      {/* Header with 3-dot menu */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs uppercase tracking-wide text-gray-400">{timestamp}</Text>
        <Pressable onPress={() => onMenu(id)} className="p-2">
          <MaterialIcons name="more-vert" size={18} color="#666" />
        </Pressable>
      </View>

      {/* Author info */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          {/* Avatar */}
          <Image source={{ uri: authorAvatar }} className="h-10 w-10 rounded-full bg-gray-200" />

          {/* Name and verification */}
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="font-semibold text-gray-900">{authorName}</Text>
              {isVerified && <MaterialIcons name="verified" size={14} color="#3b82f6" />}
            </View>
            <Text className="text-xs text-gray-500">@{authorId}</Text>
          </View>
        </View>

        {/* Faith badge */}
        <View className="items-center rounded-full bg-purple-100 px-3 py-1">
          <Text className="text-xs font-semibold text-purple-600">{faith}</Text>
        </View>
      </View>

      {/* Replying to (if applicable) */}
      {replyingTo && (
        <View className="mb-2 pl-13">
          <Text className="text-xs text-gray-500">replying to @{replyingTo}</Text>
        </View>
      )}

      {/* Comment text */}
      <View className="mb-3 pl-13">
        <Text className="leading-5 text-gray-800">{comment}</Text>
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center justify-between pl-13">
        <Pressable onPress={() => onReply(id)} className="flex-row items-center gap-1 p-2">
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text className="text-xs text-gray-600">Reply</Text>
        </Pressable>

        <Pressable onPress={() => onRepost(id)} className="flex-row items-center gap-1 p-2">
          <MaterialIcons name="repeat" size={16} color="#666" />
          <Text className="text-xs text-gray-600">Repost</Text>
        </Pressable>

        <Pressable onPress={() => setSaved(!saved)} className="flex-row items-center gap-1 p-2">
          <MaterialIcons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={16}
            color={saved ? '#f59e0b' : '#666'}
          />
          <Text className="text-xs text-gray-600">Save</Text>
        </Pressable>

        <Pressable onPress={() => onShare(id)} className="flex-row items-center gap-1 p-2">
          <Ionicons name="share-social-outline" size={16} color="#666" />
          <Text className="text-xs text-gray-600">Share</Text>
        </Pressable>
      </View>
    </View>
  )
}
