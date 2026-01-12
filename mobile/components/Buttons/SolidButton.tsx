import { Pressable, Text, ViewStyle, ActivityIndicator } from 'react-native'

interface Props {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'blue' | 'red'
  style?: ViewStyle
  loading?: boolean
}

export const SolidButton = ({ label, onPress, variant = 'primary', style, loading = false }: Props) => {
  const base = 'rounded-2xl px-6'
  const styles =
    variant === 'primary'
      ? 'bg-[#111]'
      : variant === 'secondary'
      ? 'bg-white border border-gray-200'
      : variant === 'blue'
      ? 'bg-blue-500'
      : variant === 'red'
      ? 'bg-red-600'
      : 'border border-white/10 bg-white/5'
  const textStyles = variant === 'primary' || variant === 'blue' || variant === 'red' ? 'text-white' : variant === 'secondary' ? 'text-gray-600' : 'text-slate-200'

  const buttonStyle = { paddingVertical: 4, ...style }

  return (
    <Pressable onPress={loading ? undefined : onPress} className={`${base} ${styles}`} style={buttonStyle}>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' || variant === 'blue' || variant === 'red' ? 'white' : '#5F9598'} />
      ) : (
        <Text className={`text-center text-base font-semibold ${textStyles}`}>{label}</Text>
      )}
    </Pressable>
  )
}
