import { Pressable, Text, ViewStyle } from 'react-native'

interface Props {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  style?: ViewStyle
}

export const SolidButton = ({ label, onPress, variant = 'primary', style }: Props) => {
  const base = 'rounded-full px-6'
  const styles =
    variant === 'primary'
      ? 'bg-blue-500'
      : variant === 'secondary'
      ? 'bg-white border border-gray-200'
      : 'border border-white/10 bg-white/5'
  const textStyles = variant === 'primary' ? 'text-white' : variant === 'secondary' ? 'text-gray-600' : 'text-slate-200'

  const buttonStyle = { paddingVertical: 4, ...style }

  return (
    <Pressable onPress={onPress} className={`${base} ${styles}`} style={buttonStyle}>
      <Text className={`text-center text-sm font-semibold ${textStyles}`}>{label}</Text>
    </Pressable>
  )
}
