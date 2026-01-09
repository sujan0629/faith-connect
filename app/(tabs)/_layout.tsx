import { Tabs, useSegments } from 'expo-router'
import { View } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

const TabIcon = ({ name, focused, isDarkMode, library = 'Ionicons', size = 26 }: { name: any; focused: boolean; isDarkMode: boolean; library?: 'Ionicons' | 'MaterialCommunityIcons'; size?: number }) => {
  const IconComponent = library === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons
  return (
    <View className="items-center justify-center">
      <IconComponent 
        name={name} 
        size={size} 
        color={isDarkMode ? (focused ? '#FFFFFF' : '#777') : (focused ? '#000000' : '#999999')} 
      />
    </View>
  )
}

export default function TabsLayout() {
  const segments = useSegments()
  const currentRoute = segments[segments.length - 1]
  const isReelsScreen = currentRoute === 'reels'

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isReelsScreen ? '#111111' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isReelsScreen ? '#333333' : '#f0f0f0',
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        animation: 'fade',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} isDarkMode={isReelsScreen} /> }}
      />
      <Tabs.Screen
        name="leaders"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="people" focused={focused} isDarkMode={isReelsScreen} /> }}
      />
      <Tabs.Screen
        name="reels"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="motion-play" focused={focused} isDarkMode={isReelsScreen} library="MaterialCommunityIcons" size={30} /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="chatbubbles" focused={focused} isDarkMode={isReelsScreen} /> }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="notifications" focused={focused} isDarkMode={isReelsScreen} /> }}
      />
    </Tabs>
  )
}
