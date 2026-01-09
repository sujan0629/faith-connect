import { View, Pressable, Text } from 'react-native'

interface NotificationTabsProps {
  activeTab: 'all' | 'mentions' | 'comments'
  onTabChange: (tab: 'all' | 'mentions' | 'comments') => void
}

export const NotificationTabs = ({ activeTab, onTabChange }: NotificationTabsProps) => {
  const tabs = ['all', 'mentions', 'comments'] as const

  return (
    <View className="mb-4 flex-row gap-2 border-b border-gray-200 bg-white">
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => onTabChange(tab)}
          className={`border-b-2 px-4 py-3 ${
            activeTab === tab
              ? 'border-blue-500'
              : 'border-transparent'
          }`}
        >
          <Text
            className={`text-sm font-medium capitalize ${
              activeTab === tab
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
