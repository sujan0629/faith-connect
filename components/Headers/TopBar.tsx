import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  right?: ReactNode
  onBack?: () => void
}

export const TopBar = ({ title, subtitle, right, onBack }: Props) => (
  <View className="flex-row items-center justify-between py-2.5">
    <View className="flex-row items-center gap-3">
      {onBack ? (
        <Pressable
          onPress={onBack}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>
      ) : null}
      <View>
        <Text className="text-2xl font-bold text-[#111111]">{title}</Text>
      </View>
    </View>
    {right}
  </View>
)
