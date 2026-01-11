import { View, Text, Image, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ChatHeaderProps {
  peerName: string
  avatar?: string
  isActive: boolean
  onBack: () => void
}

export const ChatHeader = ({ peerName, avatar, isActive, onBack }: ChatHeaderProps) => {
  return (
    <View className="border-b border-[#e5e5e5] bg-white px-4 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row flex-1 items-center gap-3">
          <Pressable onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color="#111111" />
          </Pressable>
          
          {/* Avatar with status */}
          <View className="relative">
            <Image
              source={{
                uri: avatar || 'https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww',
              }}
              className="h-12 w-12 rounded-full bg-gray-200"
            />
            {isActive && (
              <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </View>

          <View className="flex-1">
            <Text className="text-base font-semibold text-[#111111]">{peerName}</Text>
            <Text className="text-xs text-[#999999]">{isActive ? 'Active now' : 'Offline'}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-4">
          <Pressable>
            <Ionicons name="information-circle-outline" size={24} color="#111111" />
          </Pressable>
        </View>
      </View>
    </View>
  )
}
