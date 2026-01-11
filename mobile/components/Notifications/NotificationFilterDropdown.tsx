import React from 'react';
import FilterDropdown, { FilterSection, FilterState } from '../FilterDropdown';

// --- Constants ---
const NOTIFICATION_SECTIONS: FilterSection[] = [
  {
    key: 'sortBy',
    title: 'Sort By',
    options: ['Recent', 'Type'],
    defaultValue: 'Recent'
  },
  {
    key: 'type',
    title: 'Type',
    options: ['All', 'Mentions', 'Likes', 'Comments'],
    defaultValue: 'All'
  }
];

interface NotificationFilterDropdownProps {
  initialFilters?: FilterState;
  onApply: (filters: FilterState) => void;
}

// --- Main Component ---
const NotificationFilterDropdown: React.FC<NotificationFilterDropdownProps> = ({
  initialFilters = { sortBy: 'Recent', type: 'All' },
  onApply
}) => {
  return (
    <FilterDropdown
      sections={NOTIFICATION_SECTIONS}
      initialFilters={initialFilters}
      onApply={onApply}
      triggerLabel="Filter"
    />
  );
};

export default NotificationFilterDropdown;