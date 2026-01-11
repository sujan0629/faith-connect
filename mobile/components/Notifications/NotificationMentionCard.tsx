import { View, Text, Pressable, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'

interface NotificationMentionCardProps {
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  isVerified: boolean
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
  comment,
  replyingTo,
  timestamp,
  onReply,
  onRepost,
  onSave,
  onShare,
  onMenu,
}: NotificationMentionCardProps) => {
  const [saved, setSaved] = useState(false)

  return (
    <View className="border-b border-[#f0f0f0] bg-white px-5 pb-5 pt-4">
      {/* Author info */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2.5">
          {/* Avatar */}
          <Image source={{ uri: authorAvatar }} className="h-8 w-8 rounded-full bg-gray-200" />

          {/* Name */}
          <View className="flex-1">
            <Text className="text-base font-bold text-[#111111]">{authorName}</Text>
          </View>
        </View>

        {/* Timestamp and menu */}
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-[#999999]">{timestamp}</Text>
          <Pressable onPress={() => onMenu(id)}>
            <Text className="text-base font-bold text-[#999999]">•••</Text>
          </Pressable>
        </View>
      </View>

      {/* Replying to (if applicable) */}
      {replyingTo && (
        <View className="mb-2 pl-11">
          <Text className="text-sm text-[#999999]">replying to @{replyingTo}</Text>
        </View>
      )}

      {/* Comment text */}
      <View className="mb-3 pl-11">
        <Text className="text-sm leading-5 text-[#666666]">{comment}</Text>
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center justify-between">
        <Pressable onPress={() => onReply(id)} className="flex-row items-center gap-2">
          <Ionicons name="chatbubble-outline" size={24} color="#666666" />
        </Pressable>

        <Pressable onPress={() => onRepost(id)} className="flex-row items-center gap-2">
          <Ionicons name="repeat" size={24} color="#666666" />
        </Pressable>

        <Pressable
          className={`flex-row items-center gap-2 rounded-2xl px-5 py-2 ${
            saved ? 'bg-[#DCEBFF]' : ''
          }`}
          onPress={() => setSaved(!saved)}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={saved ? '#007AFF' : '#666666'}
          />
        </Pressable>

        <Pressable onPress={() => onShare(id)} className="flex-row items-center gap-2">
          <Ionicons name="share-social-outline" size={24} color="#666666" />
        </Pressable>
      </View>
    </View>
  )
}
