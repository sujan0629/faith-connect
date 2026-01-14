import { Text, TextInput, View, Pressable } from 'react-native'

interface Props {
  label: string
  placeholder?: string
  value: string
  onChangeText: (v: string) => void
  multiline?: boolean
  secureTextEntry?: boolean
  rightIcon?: React.ReactNode
  onRightIconPress?: () => void
}

export const TextField = ({ label, placeholder, value, onChangeText, multiline, secureTextEntry, rightIcon, onRightIconPress }: Props) => (
  <View>
    {label ? <Text className="text-sm text-gray-600">{label}</Text> : null}
    <View className="mt-2 rounded-2xl border border-gray-300 bg-white px-4 py-4 flex-row items-center">
      <TextInput
        className="flex-1 text-black text-sm"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        style={multiline ? { minHeight: 96, textAlignVertical: 'top' } : { textAlignVertical: 'center' }}
      />
      {rightIcon && (
        <Pressable onPress={onRightIconPress} className="ml-2">
          {rightIcon}
        </Pressable>
      )}
    </View>
  </View>
)
