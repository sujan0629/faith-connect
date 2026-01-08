import { ScrollView, Text, View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TopBar } from '../../components/Headers/TopBar'
import { useNotificationStore } from '../../stores/notificationStore'

export default function NotificationsScreen() {
  const { items, markRead } = useNotificationStore()

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <TopBar title="Notifications" subtitle="Activity from leaders" />
        {items.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => markRead(n.id)}
            className={`mb-3 rounded-2xl border bg-white p-4 ${
              n.unread ? 'border-blue-300' : 'border-gray-200'
            }`}
          >
            <Text className="text-base font-semibold text-gray-900">{n.title}</Text>
            <Text className="mt-1 text-sm text-gray-600">{n.body}</Text>
            <Text className="mt-2 text-[11px] uppercase tracking-wide text-gray-400">
              {new Date(n.createdAt).toLocaleDateString()}
            </Text>
          </Pressable>
        ))}

        {items.length === 0 ? (
          <View className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <Text className="text-sm text-gray-600">No notifications yet.</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}
