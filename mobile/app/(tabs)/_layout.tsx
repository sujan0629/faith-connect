import { Tabs, useSegments } from 'expo-router'
import { View } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { useCreatePostStore } from '../../stores/createPostStore'
import { CreatePostModal } from '../../components/Feed/CreatePostModal'
import { useFeedStore } from '../../stores/feedStore'

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
  const user = useAuthStore((s) => s.user)
  const isLeader = user?.role === 'leader'
  const { isModalOpen, openModal, closeModal } = useCreatePostStore()
  const addPost = useFeedStore((s) => s.addPost)

  const handlePost = (content: string) => {
    const newPost = {
      authorId: user?.id || '1',
      authorName: user?.name || 'Leader Name',
      authorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      type: 'post' as const,
      title: '',
      body: content,
      media: undefined,
      mediaType: 'none' as const,
      isLiked: false,
      isSaved: false,
    }

    addPost(newPost)
    closeModal()
  }

  return (
    <>
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
          name="create"
          options={{ 
            tabBarIcon: ({ focused }) => <TabIcon name="add-circle" focused={focused} isDarkMode={isReelsScreen} size={30} />,
            tabBarItemStyle: isLeader ? {} : { display: 'none' },
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
            tabBarIcon: ({ focused }) => <TabIcon name="motion-play" focused={focused} isDarkMode={isReelsScreen} library="MaterialCommunityIcons" size={30} />,
            tabBarItemStyle: !isLeader ? {} : { display: 'none' }
          }}
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

      <CreatePostModal
        visible={isModalOpen}
        onClose={closeModal}
        onPost={handlePost}
      />
    </>
  )
}
