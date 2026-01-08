import { useState } from 'react'
import { Link, useRouter } from 'expo-router'
import { View, Text, TextInput, Pressable } from 'react-native'
import Toast from 'react-native-toast-message'
import { Role, useAuthStore } from '../../stores/authStore'

const roles: { label: string; value: Role; blurb: string }[] = [
  { label: 'Worshiper', value: 'worshiper', blurb: 'Follow leaders and stay inspired.' },
  { label: 'Religious Leader', value: 'leader', blurb: 'Share posts, reels, and guidance.' },
]

export default function Signup() {
  const router = useRouter()
  const signup = useAuthStore((s) => s.signup)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('worshiper')

  const handleSignup = () => {
    if (!email || !name) {
      Toast.show({ type: 'error', text1: 'Name and email are required.' })
      return
    }
    signup({ email, name, role })
    Toast.show({ type: 'success', text1: 'Account created', text2: 'Set up your profile next.' })
    router.push('/onboarding/profile')
  }

  return (
    <View className="flex-1 bg-[#050914] px-6 pb-10 pt-16">
      <Text className="text-2xl font-bold text-white">Create account</Text>
      <Text className="mt-2 text-sm text-slate-400">
        Choose your role and get started with FaithConnect.
      </Text>

      <View className="mt-8 space-y-4">
        <View>
          <Text className="text-sm text-slate-300">Full name</Text>
          <TextInput
            className="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
            placeholder="Your name"
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View>
          <Text className="text-sm text-slate-300">Email</Text>
          <TextInput
            className="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
            placeholder="you@example.com"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
      </View>

      <View className="mt-6 space-y-3">
        <Text className="text-sm text-slate-300">Select your role</Text>
        {roles.map((item) => (
          <Pressable
            key={item.value}
            onPress={() => setRole(item.value)}
            className={`rounded-2xl border px-4 py-4 ${
              role === item.value ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-white/5'
            }`}
          >
            <Text className="text-base font-semibold text-white">{item.label}</Text>
            <Text className="mt-1 text-sm text-slate-300">{item.blurb}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleSignup}
        className="mt-8 rounded-2xl bg-cyan-500 px-4 py-4"
      >
        <Text className="text-center text-base font-semibold text-white">Continue</Text>
      </Pressable>

      <View className="mt-4 flex-row items-center justify-center">
        <Text className="text-sm text-slate-400">Have an account? </Text>
        <Link href="/auth/login" asChild>
          <Pressable>
            <Text className="text-sm font-semibold text-cyan-300">Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}
