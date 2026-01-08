import { Pressable, Text, ViewStyle } from 'react-native'

interface Props {
  label: string
  onPress: () => void
  variant?: 'primary' | 'ghost'
  style?: ViewStyle
}

export const SolidButton = ({ label, onPress, variant = 'primary', style }: Props) => {
  const base = 'rounded-2xl px-4 py-4'
  const styles =
    variant === 'primary'
      ? 'bg-cyan-500'
      : 'border border-white/10 bg-white/5'
  const textStyles = variant === 'primary' ? 'text-white' : 'text-slate-200'

  return (
    <Pressable onPress={onPress} className={`${base} ${styles}`} style={style}>
      <Text className={`text-center text-base font-semibold ${textStyles}`}>{label}</Text>
    </Pressable>
  )
}
