import { Pressable, Text, ViewStyle, ActivityIndicator } from 'react-native'

interface Props {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  style?: ViewStyle
  loading?: boolean
  disabled?: boolean
}

export const SolidButton = ({ label, onPress, variant = 'primary', style, loading = false, disabled = false }: Props) => {
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
    <Pressable onPress={disabled ? undefined : onPress} disabled={disabled} className={`${base} ${styles}`} style={buttonStyle}>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#ffffff' : '#222'} />
      ) : (
        <Text className={`text-center text-sm font-semibold ${textStyles}`}>{label}</Text>
      )}
    </Pressable>
  )
}