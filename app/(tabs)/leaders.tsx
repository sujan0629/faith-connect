
import LeaderTabs from '../../components/Leaders/LeaderTabs';
import LeaderSearchBar from '../../components/Leaders/LeaderSearchBar';
import LeaderSortDropdown, { FilterState } from '../../components/Leaders/LeaderSortDropdown';
import LeaderList from '../../components/Leaders/LeaderList';
import { TopBar } from '../../components/Headers/TopBar';
import { useLeaderStore } from '../../stores/leaderStore';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Text } from 'react-native';
import { useState } from 'react';


export default function LeadersScreen() {
  const router = useRouter();
  const { leaders, follow, unfollow } = useLeaderStore();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'my' | 'explore'>('explore');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'Trending',
    faith: 'All Faiths',
    verified: 'All',
  });

  const filteredLeaders = leaders
    .filter(l => (activeTab === 'my' ? l.isFollowed : true))
    .filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.faith.toLowerCase().includes(search.toLowerCase()));
  // Optionally sort here based on 'sort' value

  const handleFollow = (id: string) => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Sign in first' });
      return;
    }
    const leader = leaders.find(l => l.id === id);
    if (leader) {
      if (leader.isFollowed) unfollow(leader.id, user.id);
      else follow(leader.id, user.id);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-2">
          <TopBar title="Religious Leaders"/>
          <View className="mb-6 mt-3">
            <LeaderTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </View>
          <View className="flex-row items-center gap-2 mb-3">
            <LeaderSearchBar value={search} onChange={setSearch} />
            <LeaderSortDropdown initialFilters={filters} onApply={setFilters} />
          </View>
          <LeaderList leaders={filteredLeaders} onFollow={handleFollow} />
          {filteredLeaders.length === 0 && (
            <View className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <Text className="text-sm text-gray-600">No leaders here yet. Explore and follow to see updates.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
