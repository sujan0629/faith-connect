import { View, TextInput, Pressable, Text, Platform } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Keyboard } from 'react-native'
import { useState } from 'react'
import { useKeyboardHandler } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  interpolate, 
  Extrapolation 
} from 'react-native-reanimated'

interface Props {
  onSubmit: (text: string) => void
}

export const CommentInput = ({ onSubmit }: Props) => {
  const [comment, setComment] = useState('')
  const insets = useSafeAreaInsets()
  
  const progress = useSharedValue(0)

  useKeyboardHandler({
    onMove: (e) => {
      'worklet';
      progress.value = e.progress;
    },
    onEnd: (e) => {
      'worklet';
      progress.value = e.progress;
    },
  }, [])

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: interpolate(
        progress.value,
        [0, 1],
        // Changed end value from 12 to 0 for a flush fit
        [Math.max(insets.bottom, 16), 0], 
        Extrapolation.CLAMP
      ),
      transform: [
        { 
          translateY: interpolate(progress.value, [0, 1], [0, -5], Extrapolation.CLAMP) 
        }
      ],
    }
  })

  const actionButtonsStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      height: interpolate(progress.value, [0, 1], [0, 40], Extrapolation.CLAMP),
      // Reduced margin to tighten the overall vertical height
      marginTop: interpolate(progress.value, [0, 1], [0, 8], Extrapolation.CLAMP),
    }
  })

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment.trim())
      setComment('')
      Keyboard.dismiss()
    }
  }

  return (
    <Animated.View 
      style={[{ backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e5e5e5' }, animatedContainerStyle]}
      className="px-4 pt-4"
    >
      <View className="flex-row items-start">
        <View className="flex-1 rounded-2xl bg-[#f5f5f5] px-4 py-2">
          <View className="flex-row items-end">
            <TextInput
              className="flex-1 text-sm text-[#111111]"
              placeholder="Type comment"
              placeholderTextColor="#999999"
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
              style={{ textAlignVertical: 'center', minHeight: 30 }}
            />
            
            <Pressable 
              onPress={handleSubmit}
              className={`rounded-full ml-2 p-2 ${comment.trim() ? 'bg-black' : 'bg-transparent'}`}
            >
              <Ionicons 
                name="send" 
                size={16} 
                color={comment.trim() ? "white" : "#999999"} 
              />
            </Pressable>
          </View>
        </View>
      </View>
      
      <Animated.View style={[actionButtonsStyle, { overflow: 'hidden' }]}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row gap-6">
            <Pressable><Ionicons name="image-outline" size={20} color="#666666" /></Pressable>
            <Pressable><MaterialCommunityIcons name="file-gif-box" size={20} color="#666666" /></Pressable>
            <Pressable><Ionicons name="camera-outline" size={20} color="#666666" /></Pressable>
            <Pressable><Ionicons name="location-outline" size={20} color="#666666" /></Pressable>
          </View>

          <Text className="text-xs text-[#999999]">{comment.length}/500</Text>
        </View>
      </Animated.View>
    </Animated.View>
  )
}