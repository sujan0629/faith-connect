import { View, Text, Pressable, ScrollView } from 'react-native'

const tabs = ['Posts', 'Reels', 'Saved', 'Repost', 'Replies'] as const
export type ProfileTab = (typeof tabs)[number]

interface ProfileTabsProps {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
  showAll?: boolean
  isLeader?: boolean
  isOwnProfile?: boolean
}

export const ProfileTabs = ({ activeTab, onTabChange, showAll = true, isLeader = false, isOwnProfile = true }: ProfileTabsProps) => {
  const visibleTabs = tabs.filter(t => {
    if (isOwnProfile) {
      // Own profile
      if (isLeader) {
        // Leader: all tabs
        return true
      } else {
        // Worshipper: Saved, Repost, Replies
        return ['Saved', 'Repost', 'Replies'].includes(t)
      }
    } else {
      // Other's profile
      if (isLeader) {
        // Viewed leader: Posts, Reels, Repost, Replies
        return ['Posts', 'Reels', 'Repost', 'Replies'].includes(t)
      } else {
        // Viewed worshipper: Repost, Replies
        return ['Repost', 'Replies'].includes(t)
      }
    }
  })

  return (
    <View className="bg-white border-b border-gray-100">
      <View className="flex-row">
        {visibleTabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            className={`flex-1 py-3 border-b-2 ${
              activeTab === tab ? (isLeader ? 'border-gray-900' : 'border-gray-900') : 'border-transparent'
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                activeTab === tab ? (isLeader ? 'text-gray-900' : 'text-gray-900') : 'text-gray-500'
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}
