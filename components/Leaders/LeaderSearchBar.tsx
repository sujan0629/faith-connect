import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LeaderSearchBarProps {
  value: string;
  onChange: (text: string) => void;
}

const LeaderSearchBar: React.FC<LeaderSearchBarProps> = ({ value, onChange }) => (
  <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 flex-1 mr-2">
    <Ionicons name="search" size={20} color="#888" className="mr-2" />
    <TextInput
      className="flex-1 text-sm"
      placeholder="Search Leader"
      value={value}
      onChangeText={onChange}
      autoCapitalize="none"
      autoCorrect={false}
      placeholderTextColor="#9CA3AF"
    />
  </View>
);

export default LeaderSearchBar;
