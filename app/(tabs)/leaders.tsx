
import LeaderSearchBar from '../../components/Leaders/LeaderSearchBar';
import LeaderList from '../../components/Leaders/LeaderList';
import { LeadersHeader } from '../../components/Headers/LeadersHeader';
import { useLeaderStore, Leader } from '../../stores/leaderStore';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Text } from 'react-native';
import { useState } from 'react';
import { FilterState } from '../../components/FilterDropdown';

export default function LeadersScreen() {
  const router = useRouter();
  const { leaders, follow, unfollow } = useLeaderStore();
  const user = useAuthStore((s) => s.user);
  const isLeader = user?.role === 'leader';
  const [activeTab, setActiveTab] = useState<'My Leaders' | 'Explore' | 'Recent' | 'All Followers'>(
    isLeader ? 'Recent' : 'Explore'
  );
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'Trending',
    faith: 'All Faiths',
    verified: 'All',
  });

  // Mock followers data for leaders
  const mockFollowers = [
    { id: 'f1', name: 'John Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' },
    { id: 'f2', name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' },
    { id: 'f3', name: 'Michael Brown', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' },
    { id: 'f4', name: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1517746915202-4fbcfe86facb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' },
    { id: 'f5', name: 'David Wilson', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' },
  ];

  // Convert followers to Leader format
  const mockFollowersAsLeaders: Leader[] = mockFollowers.map(f => ({
    id: f.id,
    name: f.name,
    avatar: f.avatar,
    faith: 'Follower',
    bio: '',
    isFollowed: false,
  }));

  // LEADER VIEW
  if (isLeader) {
    const leaderActiveTab = activeTab as 'Recent' | 'All Followers';
    const filteredFollowersList = mockFollowersAsLeaders.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );
    const displayFollowers =
      leaderActiveTab === 'Recent'
        ? mockFollowersAsLeaders.slice(0, 3)
        : filteredFollowersList;

    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <LeadersHeader
          segment={leaderActiveTab as any}
          onSegmentChange={setActiveTab as any}
          filters={filters}
          onFiltersChange={setFilters}
          isLeader={true}
        />
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-4 pt-2">
            <View className="flex-row items-center gap-2 mb-3">
              <LeaderSearchBar value={search} onChange={setSearch} />
            </View>

            <LeaderList leaders={displayFollowers} hideFollowButton={true} />

            {displayFollowers.length === 0 && (
              <View className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <Text className="text-sm text-gray-600">No followers found.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // WORSHIPER VIEW
  const worshiperActiveTab = activeTab as 'My Leaders' | 'Explore';
  const filteredLeaders = leaders
    .filter(l => (worshiperActiveTab === 'My Leaders' ? l.isFollowed : true))
    .filter(
      l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.faith.toLowerCase().includes(search.toLowerCase())
    );

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
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <LeadersHeader
        segment={worshiperActiveTab}
        onSegmentChange={setActiveTab as any}
        filters={filters}
        onFiltersChange={setFilters}
        isLeader={false}
      />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-2">
          <View className="flex-row items-center gap-2 mb-3">
            <LeaderSearchBar value={search} onChange={setSearch} />
          </View>
          <LeaderList leaders={filteredLeaders} onFollow={handleFollow} hideFollowButton={false} />
          {filteredLeaders.length === 0 && (
            <View className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <Text className="text-sm text-gray-600">
                No leaders here yet. Explore and follow to see updates.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
