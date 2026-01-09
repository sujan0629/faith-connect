import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SolidButton } from '../Buttons/SolidButton';

// --- Constants ---
const SORT_BY = ['Trending', 'Near you', 'New', 'Most Followers'];
const FAITH = ['All Faiths', 'Christianity', 'Islam', 'Judaism', 'Buddhism', 'Hinduism'];
const VERIFIED = ['All', 'Verified Only'];

// --- Types ---
export interface FilterState {
  sortBy: string;
  faith: string;
  verified: string;
}

interface LeaderSortDropdownProps {
  initialFilters?: FilterState;
  onApply: (filters: FilterState) => void;
}

// --- Sub-components ---
const FilterChip = ({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-full border mb-2 mr-2 ${
      isSelected 
        ? 'bg-blue-50 border-blue-500' 
        : 'bg-white border-gray-200'
    }`}
  >
    <Text className={`text-xs font-medium ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
  <View className="mb-3 mt-4">
    <Text className="text-base font-bold text-gray-900">{title}</Text>
  </View>
);

// --- Main Component ---
const LeaderSortDropdown: React.FC<LeaderSortDropdownProps> = ({ 
  initialFilters = { sortBy: 'Trending', faith: 'All Faiths', verified: 'All' }, 
  onApply 
}) => {
  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const insets = useSafeAreaInsets();

  const handleApply = () => {
    onApply(filters);
    setVisible(false);
  };

  const handleReset = () => {
    setFilters({
      sortBy: 'Trending',
      faith: 'All Faiths',
      verified: 'All',
    });
  };

  // Calculate active filters for the badge
  const activeCount = 
    (filters.sortBy !== 'Trending' ? 1 : 0) + 
    (filters.faith !== 'All Faiths' ? 1 : 0) + 
    (filters.verified !== 'All' ? 1 : 0);

  return (
    <View>
      {/* --- Trigger Button --- */}
      <TouchableOpacity
        className={`flex-row items-center bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg ${visible ? 'bg-gray-100' : ''}`}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="filter" size={16} color="#374151" />
        <Text className="ml-2 text-xs font-semibold text-gray-700">Filter</Text>
        {activeCount > 0 && (
          <View className="ml-2 bg-blue-500 w-5 h-5 rounded-full items-center justify-center">
            <Text className="text-white text-[10px] font-bold">{activeCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* --- Modal --- */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 justify-end">

          <Pressable 
            className="absolute inset-0"
            onPress={() => setVisible(false)}
          />

          {/* Bottom Sheet */}
          <View className="bg-white rounded-t-2xl max-h-[85%] shadow-2xl">
            {/* Handle Bar */}
            <View className="items-center py-2">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-2 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-900">Filters</Text>
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Ionicons name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              className="px-6" 
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <SectionHeader title="Sort By" />
              <View className="flex-row flex-wrap">
                {SORT_BY.map(option => (
                  <FilterChip
                    key={option}
                    label={option}
                    isSelected={filters.sortBy === option}
                    onPress={() => setFilters({ ...filters, sortBy: option })}
                  />
                ))}
              </View>

              <View className="h-[1px] bg-gray-100 my-2" />

              <SectionHeader title="Faith" />
              <View className="flex-row flex-wrap">
                {FAITH.map(item => (
                  <FilterChip
                    key={item}
                    label={item}
                    isSelected={filters.faith === item}
                    onPress={() => setFilters({ ...filters, faith: item })}
                  />
                ))}
              </View>

              <View className="h-[1px] bg-gray-100 my-2" />

              <SectionHeader title="Verification" />
              <View className="flex-row flex-wrap">
                {VERIFIED.map(item => (
                  <FilterChip
                    key={item}
                    label={item}
                    isSelected={filters.verified === item}
                    onPress={() => setFilters({ ...filters, verified: item })}
                  />
                ))}
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={{ paddingBottom: insets.bottom }}>
              <View className="flex-row gap-3 px-6 py-4 border-t border-gray-100">
                <SolidButton
                  label="Reset"
                  onPress={handleReset}
                  variant="secondary"
                  style={{ flex: 1, paddingVertical: 12, borderRadius:  30 }}
                />
                
                <SolidButton
                  label="Apply Filters"
                  onPress={handleApply}
                  variant="primary"
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 30 }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LeaderSortDropdown;
