import { useState } from 'react'
import { useRouter } from 'expo-router'
import { View, Text, TextInput, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useAuthStore } from '../../stores/authStore'

const faiths = ['Christianity', 'Islam', 'Judaism', 'Other']

export default function ProfileSetup() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const completeProfile = useAuthStore((s) => s.completeProfile)
  const [name, setName] = useState(user?.name || '')
  const [faith, setFaith] = useState(user?.faith || faiths[0])
  const [bio, setBio] = useState(user?.bio || '')

  const handleSave = () => {
    if (!name) {
      Toast.show({ type: 'error', text1: 'Name is required.' })
      return
    }
    completeProfile({ name, faith, bio })
    Toast.show({ type: 'success', text1: 'Profile updated' })
    router.replace('/(tabs)/home')
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-6 pb-10 pt-8">
        <Text className="text-2xl font-bold text-gray-900">Set up your profile</Text>
        <Text className="mt-2 text-sm text-gray-600">
          Personalize your experience and let others know who you are.
        </Text>

        <View className="mt-8 space-y-4">
          <View>
            <Text className="text-sm text-gray-700 font-medium">Full name</Text>
            <TextInput
              className="mt-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900"
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View>
            <Text className="text-sm text-gray-700 font-medium">Faith</Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {faiths.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setFaith(item)}
                  className={`rounded-full px-4 py-2 ${
                    faith === item ? 'bg-blue-500' : 'bg-gray-100'
                  }`}
                >
                  <Text className={`text-sm font-medium ${faith === item ? 'text-white' : 'text-gray-700'}`}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View>
            <Text className="text-sm text-gray-700 font-medium">Short bio</Text>
            <TextInput
              className="mt-2 min-h-[100px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900"
              placeholder="Share a line about you or your community"
              placeholderTextColor="#9CA3AF"
              multiline
              value={bio}
              onChangeText={setBio}
            />
          </View>
        </View>

        <Pressable
          onPress={handleSave}
          className="mt-10 rounded-2xl bg-blue-500 px-4 py-4"
        >
          <Text className="text-center text-base font-semibold text-white">Continue to app</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
