import { View, TextInput, Pressable, Text } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

interface ChatInputProps {
  value: string
  onChangeText: (text: string) => void
  onSend: (text: string) => void
  isKeyboardVisible?: boolean
}

export const ChatInput = ({ value, onChangeText, onSend, isKeyboardVisible = false }: ChatInputProps) => {

  const handleSend = () => {
    const msg = value.trim()
    if (msg) {
      // Clear input immediately for instant UX
      onChangeText('')
      onSend(msg)
    }
  }

  return (
    <View className="bg-white px-4 py-2">
      <View className="flex-row items-end gap-3">
        {/* Text Input */}
        <View className="flex-1 rounded-2xl bg-[#f5f5f5] px-4 py-2">
          <View className="flex-row items-end">
            <TextInput
              className="flex-1 text-sm text-[#111111]"
              placeholder="Type message..."
              placeholderTextColor="#999999"
              value={value}
              onChangeText={onChangeText}
              multiline
              maxLength={500}
              style={{ textAlignVertical: 'center', minHeight: 30 }}
            />

            {/* Send button inside input */}
            <View
              className={`rounded-3xl ml-4 px-4 py-2 ${
                value.trim() ? 'bg-black' : 'bg-transparent'
              }`}
            >
              <Pressable onPress={handleSend}>
                <Ionicons
                  name="send"
                  size={16}
                  color={value.trim() ? 'white' : 'black'}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Buttons - Only show when keyboard is visible */}
      {isKeyboardVisible && (
        <View className="mt-3 ml-1 flex-row justify-between items-center">
          <View className="flex-row gap-6">
            {/* Image button */}
            <Pressable>
              <Ionicons name="image-outline" size={20} color="#666666" />
            </Pressable>

            {/* GIF button */}
            <Pressable>
              <MaterialCommunityIcons name="file-gif-box" size={20} color="#666666" />
            </Pressable>

            {/* Camera button */}
            <Pressable>
              <Ionicons name="camera-outline" size={20} color="#666666" />
            </Pressable>

            {/* Location button */}
            <Pressable>
              <Ionicons name="location-outline" size={20} color="#666666" />
            </Pressable>
          </View>

          {/* Character count */}
          <Text className="text-xs text-[#999999]">{value.length}/500</Text>
        </View>
      )}
    </View>
  )
}
