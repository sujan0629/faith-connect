
import LeaderSearchBar from '../../components/Leaders/LeaderSearchBar';
import LeaderList from '../../components/Leaders/LeaderList';
import { LeadersHeader } from '../../components/Headers/LeadersHeader';
import { useLeaderStore } from '../../stores/leaderStore';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { FilterState } from '../../components/FilterDropdown';
import { leadersApi } from '../../api/leaders';
import type { Follower } from '@faithconnect/shared';

export default function LeadersScreen() {
  const router = useRouter();
  const { leaders, loading, error, fetchLeaders, follow, unfollow } = useLeaderStore();
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
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      if (isLeader && user?.id) {
        const data = await leadersApi.getFollowers(user.id);
        setFollowers(data);
      } else {
        await fetchLeaders({
          faith: filters.faith !== 'All Faiths' ? filters.faith : undefined,
          search: search || undefined,
        });
      }
    } finally {
      setRefreshing(false)
    }
  }

  const handleOpenProfile = (profileId: string) => {
    router.push(`/profile/${profileId}` as any);
  };

  // Fetch leaders on mount and when filters change
  useEffect(() => {
    if (!isLeader) {
      fetchLeaders({
        faith: filters.faith !== 'All Faiths' ? filters.faith : undefined,
        search: search || undefined,
      });
    }
  }, [filters.faith, search, isLeader]);

  // Fetch followers for leaders
  useEffect(() => {
    if (isLeader && user?.id) {
      const fetchFollowers = async () => {
        setFollowersLoading(true);
        try {
          const data = await leadersApi.getFollowers(user.id);
          setFollowers(data);
        } catch (error) {
          console.error('Failed to fetch followers:', error);
        } finally {
          setFollowersLoading(false);
        }
      };
      fetchFollowers();
    }
  }, [isLeader, user?.id]);

  // Mock followers data for leaders (keeping for now, but will be replaced with real data)
  const mockFollowersAsLeaders: Follower[] = followers.map(f => ({
    id: f.id,
    name: f.name,
    username: f.username,
    avatar: f.avatar,
    bio: f.bio,
    faith: f.faith,
  }));

  // LEADER VIEW
  if (isLeader) {
    const leaderActiveTab = activeTab as 'Recent' | 'All Followers';
    const filteredFollowersList = mockFollowersAsLeaders.filter(f =>
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.username?.toLowerCase().includes(search.toLowerCase())
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
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
          <View className="px-4 pt-2">
            <View className="flex-row items-center gap-2 mb-3">
              <LeaderSearchBar value={search} onChange={setSearch} />
            </View>

            {followersLoading ? (
              <View className="flex-1 justify-center items-center py-8">
                <ActivityIndicator size="small" color="#222" />
              </View>
            ) : (
              <LeaderList
                leaders={displayFollowers as any}
                hideFollowButton={true}
                onOpenProfile={handleOpenProfile}
              />
            )}

            {!followersLoading && displayFollowers.length === 0 && (
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
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.faith?.toLowerCase().includes(search.toLowerCase()) ||
        l.bio?.toLowerCase().includes(search.toLowerCase())
    );

  const handleFollow = async (id: string) => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Sign in first', text2: 'Please sign in to follow leaders' });
      return;
    }
    try {
      await follow(id, user.id);
      Toast.show({ type: 'success', text1: 'Following!', text2: 'You are now following this leader' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to follow', text2: 'Please try again later' });
    }
  };

  const handleUnfollow = async (id: string) => {
    if (!user) return;
    try {
      await unfollow(id, user.id);
      Toast.show({ type: 'success', text1: 'Unfollowed', text2: 'You have unfollowed this leader' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to unfollow', text2: 'Please try again later' });
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
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View className="px-4 pt-2">
          <View className="flex-row items-center gap-2 mb-3">
            <LeaderSearchBar value={search} onChange={setSearch} />
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="small" color="#222" />
            </View>
          ) : (
            <LeaderList
              leaders={filteredLeaders}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              onOpenProfile={handleOpenProfile}
              hideFollowButton={false}
            />
          )}

          {error && (
            <View className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          )}

          {!loading && !error && filteredLeaders.length === 0 && (
  <View className="mt-6 items-center p-4">
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
