import React from 'react';
import FilterDropdown, { FilterSection, FilterState } from '../FilterDropdown';

// --- Constants ---
const LEADER_SECTIONS: FilterSection[] = [
  {
    key: 'sortBy',
    title: 'Sort By',
    options: ['Trending', 'Near you', 'New', 'Most Followers'],
    defaultValue: 'Trending'
  },
  {
    key: 'faith',
    title: 'Faith',
    options: ['All Faiths', 'Christianity', 'Islam', 'Judaism', 'Buddhism', 'Hinduism'],
    defaultValue: 'All Faiths'
  },
  {
    key: 'verified',
    title: 'Verification',
    options: ['All', 'Verified Only'],
    defaultValue: 'All'
  }
];

interface LeaderSortDropdownProps {
  initialFilters?: FilterState;
  onApply: (filters: FilterState) => void;
}

// --- Main Component ---
const LeaderSortDropdown: React.FC<LeaderSortDropdownProps> = ({
  initialFilters = { sortBy: 'Trending', faith: 'All Faiths', verified: 'All' },
  onApply
}) => {
  return (
    <FilterDropdown
      sections={LEADER_SECTIONS}
      initialFilters={initialFilters}
      onApply={onApply}
      triggerLabel="Filter"
    />
  );
};

export default LeaderSortDropdown;
