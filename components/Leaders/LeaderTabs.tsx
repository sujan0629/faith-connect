import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface LeaderTabsProps {
  activeTab: 'my' | 'explore';
  onTabChange: (tab: 'my' | 'explore') => void;
}

const LeaderTabs: React.FC<LeaderTabsProps> = ({ activeTab, onTabChange }) => (
  <View className="flex-row gap-0 bg-gray-100 rounded-full p-1 flex-1">
    <TouchableOpacity
      className={`flex-1 rounded-full px-4 py-2.5 ${activeTab === 'my' ? 'bg-[#2b2b2b]' : 'bg-transparent'}`}
      onPress={() => onTabChange('my')}
    >
      <Text className={`text-center text-sm font-semibold ${activeTab === 'my' ? 'text-white' : 'text-gray-600'}`}>My Leaders</Text>
    </TouchableOpacity>
    <TouchableOpacity
      className={`flex-1 rounded-full px-4 py-2.5 ${activeTab === 'explore' ? 'bg-[#2b2b2b]' : 'bg-transparent'}`}
      onPress={() => onTabChange('explore')}
    >
      <Text className={`text-center text-sm font-semibold ${activeTab === 'explore' ? 'text-white' : 'text-gray-600'}`}>Explore</Text>
    </TouchableOpacity>
  </View>
);

export default LeaderTabs;
