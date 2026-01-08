import { Tabs } from 'expo-router'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const TabIcon = ({ name, focused }: { name: any; focused: boolean }) => (
  <View className="items-center justify-center">
    <Ionicons name={name} size={26} color={focused ? '#000000' : '#999999'} />
  </View>
)

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="leaders"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="ribbon" focused={focused} /> }}
      />
      <Tabs.Screen
        name="reels"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="play-circle" focused={focused} /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="chatbubbles" focused={focused} /> }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="notifications" focused={focused} /> }}
      />
    </Tabs>
  )
}
