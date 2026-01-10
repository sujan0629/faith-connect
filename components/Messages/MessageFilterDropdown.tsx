import React from 'react';
import FilterDropdown, { FilterSection, FilterState } from '../FilterDropdown';

// --- Constants ---
const MESSAGE_SECTIONS: FilterSection[] = [
  {
    key: 'sortBy',
    title: 'Sort By',
    options: ['Recent', 'Unread First', 'Alphabetical'],
    defaultValue: 'Recent'
  },
  {
    key: 'status',
    title: 'Status',
    options: ['All', 'Unread', 'Read'],
    defaultValue: 'All'
  }
];

interface MessageFilterDropdownProps {
  initialFilters?: FilterState;
  onApply: (filters: FilterState) => void;
}

// --- Main Component ---
const MessageFilterDropdown: React.FC<MessageFilterDropdownProps> = ({
  initialFilters = { sortBy: 'Recent', status: 'All' },
  onApply
}) => {
  return (
    <FilterDropdown
      sections={MESSAGE_SECTIONS}
      initialFilters={initialFilters}
      onApply={onApply}
      triggerLabel="Filter"
    />
  );
};

export default MessageFilterDropdown;