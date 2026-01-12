import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SolidButton } from './Buttons/SolidButton';

// --- Types ---
export interface FilterSection {
  key: string;
  title: string;
  options: string[];
  defaultValue: string;
}

export interface FilterState {
  [key: string]: string;
}

interface FilterDropdownProps {
  sections: FilterSection[];
  initialFilters?: FilterState;
  onApply: (filters: FilterState) => void;
  triggerLabel?: string;
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
const FilterDropdown: React.FC<FilterDropdownProps> = ({
  sections,
  initialFilters = {},
  onApply,
  triggerLabel = "Filter"
}) => {
  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(() => {
    const defaults: FilterState = {};
    sections.forEach(section => {
      defaults[section.key] = initialFilters[section.key] || section.defaultValue;
    });
    return defaults;
  });
  const insets = useSafeAreaInsets();

  const handleApply = () => {
    onApply(filters);
    setVisible(false);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {};
    sections.forEach(section => {
      resetFilters[section.key] = section.defaultValue;
    });
    setFilters(resetFilters);
  };

  // Calculate active filters for the badge
  const activeCount = sections.reduce((count, section) => {
    return count + (filters[section.key] !== section.defaultValue ? 1 : 0);
  }, 0);

  return (
    <View>
      {/* --- Trigger Button --- */}
      <TouchableOpacity
        className="h-9 w-9 items-center justify-center"
        onPress={() => setVisible(true)}
      >
        <Ionicons name="filter" size={24} color="#111111" />
        {activeCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-blue-500 w-5 h-5 rounded-full items-center justify-center">
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
              {sections.map((section, index) => (
                <View key={section.key}>
                  <SectionHeader title={section.title} />
                  <View className="flex-row flex-wrap">
                    {section.options.map(option => (
                      <FilterChip
                        key={option}
                        label={option}
                        isSelected={filters[section.key] === option}
                        onPress={() => setFilters({ ...filters, [section.key]: option })}
                      />
                    ))}
                  </View>
                  {index < sections.length - 1 && <View className="h-[1px] bg-gray-100 my-2" />}
                </View>
              ))}
            </ScrollView>

            {/* Footer Actions */}
            <View style={{ paddingBottom: insets.bottom }}>
              <View className="flex-row gap-3 px-6 py-4 border-t border-gray-100">
                <SolidButton
                  label="Reset"
                  onPress={handleReset}
                  variant="secondary"
                  style={{ flex: 1, paddingVertical: 12 }}
                />

                <SolidButton
                  label="Apply Filters"
                  onPress={handleApply}
                  variant="blue"
                  style={{ flex: 1, paddingVertical: 12 }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FilterDropdown;