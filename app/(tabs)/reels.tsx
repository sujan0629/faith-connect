import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { TopBar } from '../../components/Headers/TopBar'
import { useFeedStore } from '../../stores/feedStore'

export default function ReelsScreen() {
  const { explore } = useFeedStore()
  const reels = explore.filter((p) => p.type === 'reel')

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <TopBar title="Reels" subtitle="Swipe through quick inspiration" />
        {reels.map((reel) => (
          <View key={reel.id} className="mb-4 rounded-3xl border border-gray-200 bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-blue-600 font-medium">{reel.authorName}</Text>
              <View className="rounded-full bg-blue-100 px-3 py-1">
                <Text className="text-xs text-blue-700 font-medium">Reel</Text>
              </View>
            </View>
            <Text className="mt-2 text-lg font-semibold text-gray-900">{reel.title}</Text>
            <Text className="mt-1 text-sm text-gray-600">{reel.body}</Text>
            <View className="mt-3 flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <Ionicons name="heart-outline" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600">{reel.likes}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="bookmark-outline" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600">{reel.saves}</Text>
              </View>
            </View>
          </View>
        ))}

        {reels.length === 0 ? (
          <View className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <Text className="text-sm text-gray-600">No reels yet. Stay tuned.</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}
