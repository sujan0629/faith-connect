import { View, Text, Image } from 'react-native'

interface MessageBubbleProps {
  content: string
  timestamp: string
  isMine: boolean
  senderName?: string
  avatar?: string
}

export const MessageBubble = ({ content, timestamp, isMine, senderName, avatar }: MessageBubbleProps) => {
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return (
    <View className={`mb-3 ${isMine ? 'items-end' : 'items-start'}`}>
      {!isMine ? (
        <View className="flex-row items-start gap-2">
          {avatar && (
            <Image
              source={{ uri: avatar }}
              className="h-8 w-8 rounded-full bg-gray-200 mt-1"
            />
          )}
          <View>
            <View
              className={`rounded-2xl px-4 py-3 bg-[#f0f0f0]`}
            >
              <Text className="text-sm text-[#111111]">
                {content}
              </Text>
            </View>
            <Text className="mt-1 text-xs text-[#999999] ml-2">
              {formattedTime}
            </Text>
          </View>
        </View>
      ) : (
        <View className="items-end">
          <View className="rounded-2xl px-4 py-3 bg-blue-500">
            <Text className="text-sm text-white">
              {content}
            </Text>
          </View>
          <Text className="mt-1 text-xs text-[#999999] mr-2">
            {formattedTime}
          </Text>
        </View>
      )}
    </View>
  )
}
