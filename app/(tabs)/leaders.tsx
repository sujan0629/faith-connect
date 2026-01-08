import { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import { LeaderCard } from '../../components/Leaders/LeaderCard'
import { TopBar } from '../../components/Headers/TopBar'
import { useAuthStore } from '../../stores/authStore'
import { useLeaderStore } from '../../stores/leaderStore'

const segments = ['Explore Leaders', 'My Leaders'] as const

type Segment = (typeof segments)[number]

export default function LeadersScreen() {
  const router = useRouter()
  const [segment, setSegment] = useState<Segment>('Explore Leaders')
  const { leaders, follow, unfollow } = useLeaderStore()
  const user = useAuthStore((s) => s.user)
  const myLeaders = useMemo(() => leaders.filter((l) => l.isFollowed), [leaders])

  const toggleFollow = (leaderId: string, willFollow: boolean) => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Sign in first' })
      return
    }
    if (willFollow) follow(leaderId, user.id)
    else unfollow(leaderId, user.id)
  }

  const data = segment === 'Explore Leaders' ? leaders : myLeaders

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <TopBar title="Leaders" subtitle="Discover or manage your follows" />

        <View className="mb-4 flex-row rounded-full bg-gray-100 p-1">
          {segments.map((item) => (
            <Text
              key={item}
              onPress={() => setSegment(item)}
              className={`flex-1 rounded-full px-4 py-3 text-center text-sm font-medium ${
                segment === item ? 'bg-white text-gray-900' : 'text-gray-600'
              }`}
            >
              {item}
            </Text>
          ))}
        </View>

      {data.map((leader) => (
        <LeaderCard
          key={leader.id}
          item={leader}
          onToggleFollow={toggleFollow}
          onOpenProfile={(id) => router.push(`/leaders/${id}`)}
        />
      ))}

      {data.length === 0 ? (
        <View className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <Text className="text-sm text-gray-600">No leaders here yet. Explore and follow to see updates.</Text>
        </View>
      ) : null}
    </ScrollView>
    </SafeAreaView>
  )
}
