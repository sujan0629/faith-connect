import { Text, TextInput, View } from 'react-native'

interface Props {
  label: string
  placeholder?: string
  value: string
  onChangeText: (v: string) => void
  multiline?: boolean
  secureTextEntry?: boolean
}

export const TextField = ({ label, placeholder, value, onChangeText, multiline, secureTextEntry }: Props) => (
  <View>
    <Text className="text-sm text-slate-300">{label}</Text>
    <TextInput
      className="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
      placeholder={placeholder}
      placeholderTextColor="#64748b"
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      secureTextEntry={secureTextEntry}
      style={multiline ? { minHeight: 96, textAlignVertical: 'top' } : undefined}
    />
  </View>
)
