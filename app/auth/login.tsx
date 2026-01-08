import { useState } from 'react'
import { Link, useRouter } from 'expo-router'
import { View, Text, TextInput, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useAuthStore } from '../../stores/authStore'

export default function Login() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const user = useAuthStore((s) => s.user)
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Please enter your email.' })
      return
    }
    login({ email })
    Toast.show({ type: 'success', text1: 'Welcome back' })
    router.push('/onboarding/profile')
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-6 pb-10 pt-8">
        <Text className="text-2xl font-bold text-gray-900">Welcome back</Text>
        <Text className="mt-2 text-sm text-gray-600">
          Sign in to continue exploring content and conversations.
        </Text>

        <View className="mt-10 space-y-4">
          <View>
            <Text className="text-sm text-gray-700 font-medium">Email</Text>
            <TextInput
              className="mt-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900"
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View>
            <Text className="text-sm text-gray-700 font-medium">Password</Text>
            <TextInput
              className="mt-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <Pressable
          onPress={handleLogin}
          className="mt-8 rounded-2xl bg-blue-500 px-4 py-4"
        >
          <Text className="text-center text-base font-semibold text-white">Continue</Text>
        </Pressable>

        <View className="mt-4 flex-row items-center justify-center">
          <Text className="text-sm text-gray-600">New here? </Text>
          <Link href="/auth/signup" asChild>
            <Pressable>
              <Text className="text-sm font-semibold text-blue-600">Create account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}
