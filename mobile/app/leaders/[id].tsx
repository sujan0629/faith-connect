import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, Text, View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TopBar } from '../../components/Headers/TopBar'
import { useLeaderStore } from '../../stores/leaderStore'
import { useFeedStore } from '../../stores/feedStore'
import { useAuthStore } from '../../stores/authStore'
import Toast from 'react-native-toast-message'

export default function LeaderProfile() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { leaders, follow, unfollow } = useLeaderStore()
  const { explore } = useFeedStore()
  const user = useAuthStore((s) => s.user)

  const leader = leaders.find((l) => l.id === id)
  const posts = explore.filter((p) => p.authorId === id)

  if (!leader) {
    return (
      <View className="flex-1 items-center justify-center bg-[#050914]">
        <Text className="text-white">Leader not found</Text>
      </View>
    )
  }

  const toggleFollow = () => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Sign in first' })
      return
    }
    leader.isFollowed ? unfollow(leader.id, user.id) : follow(leader.id, user.id)
  }

  return (
    <ScrollView className="flex-1 bg-[#050914]" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <TopBar title={leader.name} subtitle={leader.faith} onBack={() => router.back()} />

      <View className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <Text className="text-sm text-cyan-300">{leader.faith}</Text>
        <Text className="mt-1 text-lg font-semibold text-white">{leader.name}</Text>
        <Text className="mt-2 text-sm text-slate-300">{leader.bio}</Text>
        <View className="mt-3 flex-row gap-2">
          <Pressable
            onPress={toggleFollow}
            className={`rounded-full px-4 py-2 ${
              leader.isFollowed ? 'bg-white/10' : 'bg-cyan-500'
            }`}
          >
            <Text className="text-sm font-semibold text-white">
              {leader.isFollowed ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(`/messages/${leader.id}`)}
            className="rounded-full border border-white/10 px-4 py-2"
          >
            <Text className="text-sm font-semibold text-white">Message</Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-6 flex-row items-center gap-2">
        <Ionicons name="grid" size={18} color="#22d3ee" />
        <Text className="text-sm font-semibold text-white">Posts & Reels</Text>
      </View>

      {posts.map((p) => (
        <View key={p.id} className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <Text className="text-xs uppercase tracking-wide text-slate-400">{p.type}</Text>
          <Text className="text-base font-semibold text-white">{p.title}</Text>
          <Text className="mt-1 text-sm text-slate-300">{p.body}</Text>
        </View>
      ))}

      {posts.length === 0 ? (
        <View className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <Text className="text-sm text-slate-200">No posts yet from this leader.</Text>
        </View>
      ) : null}
    </ScrollView>
  )
}
