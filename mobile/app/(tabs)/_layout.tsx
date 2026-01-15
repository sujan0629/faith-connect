import { Tabs, useSegments } from 'expo-router'
import { View, Platform } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { useCreatePostStore } from '../../stores/createPostStore'
import { CreatePostModal } from '../../components/Feed/CreatePostModal'
import { useFeedStore } from '../../stores/feedStore'

type IconName = string | { active: string; inactive: string }

const TabIcon = ({ name, focused, library = 'Ionicons', size = 20 }: { name: IconName; focused: boolean; library?: 'Ionicons' | 'MaterialCommunityIcons'; size?: number }) => {
  const IconComponent = library === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons

  const iconColor = focused ? '#000000' : '#FFFFFF'
  const circleBg = focused ? '#FFFFFF' : 'transparent'

  const resolvedName = typeof name === 'string' ? name : (focused ? name.active : name.inactive)

  // Icon libraries expect a narrow union of icon names; cast to `any` because
  // we resolve the name dynamically (active/inactive pairs).
  const resolvedNameAny: any = resolvedName

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: circleBg,
      width: size + 10, // Compact circle
      height: size + 10,
      borderRadius: (size + 10) / 2,
    }}>
      <IconComponent 
        name={resolvedNameAny} 
        size={size} 
        color={iconColor} 
      />
    </View>
  )
}

export default function TabsLayout() {
  const segments = useSegments()
  const currentRoute = segments[segments.length - 1]
  const isReelsScreen = currentRoute === 'reels'
  const user = useAuthStore((s) => s.user)
  const isLeader = user?.role === 'leader'
  const { isModalOpen, openModal, closeModal } = useCreatePostStore()
  const addPost = useFeedStore((s) => s.addPost)

  // Reduced height for a compacter look
  const BAR_HEIGHT = 50;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          animation: 'fade',
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              bottom: 24, // Lifted slightly higher off the bottom
              marginHorizontal: 20,
              height: BAR_HEIGHT,
              borderRadius: BAR_HEIGHT / 2,
              backgroundColor: '#222222',
              borderTopWidth: 0,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            },
            default: {
              backgroundColor: isReelsScreen ? '#111111' : '#222222',
              height: 60,
            }
          }),
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            height: BAR_HEIGHT,
          },
          tabBarIconStyle: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }
        }}
      >
        <Tabs.Screen
          name="home"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name={{ active: 'home', inactive: 'home-outline' }} focused={focused} size={22} /> }}
        />
        <Tabs.Screen
          name="leaders"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name={{ active: 'people', inactive: 'people-outline' }} focused={focused} size={22} /> }}
        />
        <Tabs.Screen
          name="create"
          options={{ 
            tabBarIcon: ({ focused }) => <TabIcon name={{ active: 'add-circle', inactive: 'add-circle-outline' }} focused={focused} size={24} />,
            tabBarItemStyle: [
              { justifyContent: 'center', alignItems: 'center', height: BAR_HEIGHT },
              !isLeader && { display: 'none' }
            ],
          }}
          listeners={{
            tabPress: (e) => {
              if (isLeader) {
                e.preventDefault()
                openModal()
              }
            },
          }}
        />
        <Tabs.Screen
          name="reels"
          options={{ 
            tabBarIcon: ({ focused }) => <TabIcon name={{ active: 'play-circle', inactive: 'play-circle-outline' }} focused={focused} library="MaterialCommunityIcons" size={26} />,
            tabBarItemStyle: [
               { justifyContent: 'center', alignItems: 'center', height: BAR_HEIGHT },
              isLeader && { display: 'none' }
            ]
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name={{ active: 'chatbubbles', inactive: 'chatbubbles-outline' }} focused={focused} size={22} /> }}
        />
        <Tabs.Screen
          name="notifications"
          options={{ tabBarIcon: ({ focused }) => <TabIcon name={{ active: 'notifications', inactive: 'notifications-outline' }} focused={focused} size={22} /> }}
        />
      </Tabs>

      <CreatePostModal
        visible={isModalOpen}
        onClose={closeModal}
        onPost={(content) => {
          addPost({ id: `post_${Date.now()}`, body: content, createdAt: new Date().toISOString() } as any)
          closeModal()
        }}
      />
    </>
  )
}