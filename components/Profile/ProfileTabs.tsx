import { View, Text, Pressable, ScrollView } from 'react-native'

const tabs = ['Posts', 'Reels', 'Saved', 'Repost', 'Replies', 'Likes'] as const
export type ProfileTab = (typeof tabs)[number]

interface ProfileTabsProps {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
  showAll?: boolean
  isLeader?: boolean
}

export const ProfileTabs = ({ activeTab, onTabChange, showAll = true, isLeader = false }: ProfileTabsProps) => {
  const visibleTabs = tabs.filter(t => {
    // For worshippers, hide Posts and Reels only
    if (!isLeader && (t === 'Posts' || t === 'Reels')) {
      return false
    }
    return true
  })

  return (
    <View className="bg-white border-b border-gray-100">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {visibleTabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            className={`px-4 py-3 border-b-2 ${
              activeTab === tab ? (isLeader ? 'border-yellow-400' : 'border-gray-900') : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab ? (isLeader ? 'text-yellow-600' : 'text-gray-900') : 'text-gray-500'
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
