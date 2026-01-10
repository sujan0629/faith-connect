import { View, Pressable, Text } from 'react-native'

interface NotificationTabsProps {
  activeTab: 'all' | 'mentions'
  onTabChange: (tab: 'all' | 'mentions') => void
}

export const NotificationTabs = ({ activeTab, onTabChange }: NotificationTabsProps) => {
  const tabs = ['all', 'mentions'] as const

  return (
    <View className="mb-4 mt-4 flex-row gap-0 bg-gray-100 mx-4 rounded-full p-1">
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onTabChange(tab)}
          className={`flex-1 rounded-full px-6 py-2.5 ${activeTab === tab ? 'bg-[#2b2b2b]' : 'bg-transparent'}`}
        >
          <Text className={`text-center text-sm font-semibold capitalize ${activeTab === tab ? 'text-white' : 'text-gray-600'}`}>
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
