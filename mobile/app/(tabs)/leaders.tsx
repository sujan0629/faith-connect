
import LeaderSearchBar from '../../components/Leaders/LeaderSearchBar';
import LeaderList from '../../components/Leaders/LeaderList';
import { LeadersHeader } from '../../components/Headers/LeadersHeader';
import { LeadersSkeleton } from '../../components/Skeletons/LeaderSkeleton';
import { useLeaderStore } from '../../stores/leaderStore';
import { useAuthStore } from '../../stores/authStore';
import { useDebouncedRouter } from '../../hooks/useDebounce';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { FilterState } from '../../components/FilterDropdown';
import { leadersApi } from '../../api/leaders';
import type { Follower } from '@faithconnect/shared';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkSync } from '../../hooks/useNetworkSync';
import { useOfflineStore } from '../../stores/offlineStore';
import { cacheFeedForOffline, getCachedFeedForOffline } from '../../lib/caching';
import { useHideTabOnScroll } from '../../hooks/useHideTabOnScroll';

export default function LeadersScreen() {
  const router = useDebouncedRouter();
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
  const { isOffline } = useNetworkSync();
  const { isSyncing, syncError } = useOfflineStore();
  const onScroll = useHideTabOnScroll();

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      if (isLeader && user?.id) {
        const data = await leadersApi.getFollowers(user.id);
        setFollowers(data);
        await cacheFeedForOffline('leaders_followers', data);
      } else {
        await fetchLeaders({
          faith: filters.faith !== 'All Faiths' ? filters.faith : undefined,
          search: search || undefined,
        });
        await cacheFeedForOffline('leaders_explore', leaders);
      }
    } catch (error) {
      console.error('Failed to refresh leaders:', error);
      if (isOffline) {
        Toast.show({ type: 'info', text1: 'Offline', text2: 'Using cached data' });
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
      const loadLeaders = async () => {
        try {
          await fetchLeaders({
            faith: filters.faith !== 'All Faiths' ? filters.faith : undefined,
            search: search || undefined,
          });
          // Cache the leaders after successful fetch
          await cacheFeedForOffline('leaders_explore', leaders);
        } catch (error) {
          console.error('Failed to fetch leaders:', error);
          // Try to load from cache if network fails
          if (isOffline) {
            const cached = await getCachedFeedForOffline('leaders_explore');
            if (cached) {
              Toast.show({ type: 'info', text1: 'Offline', text2: 'Showing cached leaders' });
            }
          }
        }
      };
      loadLeaders();
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
          // Cache followers after successful fetch
          await cacheFeedForOffline('leaders_followers', data);
        } catch (error) {
          console.error('Failed to fetch followers:', error);
          // Try to load from cache if network fails
          if (isOffline) {
            const cached = await getCachedFeedForOffline('leaders_followers');
            if (cached) {
              setFollowers(cached);
              Toast.show({ type: 'info', text1: 'Offline', text2: 'Showing cached followers' });
            }
          }
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
        {isOffline && (
          <View className="bg-gray-100 px-4 py-2 flex-row items-center gap-2">
            <Ionicons name="warning" size={16} color="#3b82f6" />
            <Text className="text-xs font-medium text-gray-800">
              {isSyncing ? 'Syncing offline changes...' : syncError ? 'Sync failed' : 'Offline mode'}
            </Text>
          </View>
        )}
        <LeadersHeader
          segment={leaderActiveTab as any}
          onSegmentChange={setActiveTab as any}
          filters={filters}
          onFiltersChange={setFilters}
          isLeader={true}
        />
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} onScroll={onScroll} scrollEventThrottle={16} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
          <View className="px-4 pt-2">
            <View className="flex-row items-center gap-2 mb-3">
              <LeaderSearchBar value={search} onChange={setSearch} />
            </View>

            {followersLoading ? (
              <LeadersSkeleton />
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
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to follow', text2: 'Please try again later' });
    }
  };

  const handleUnfollow = async (id: string) => {
    if (!user) return;
    try {
      await unfollow(id, user.id);
      Toast.show({ type: 'success', text1: 'Unfollowed', text2: 'You have unfollowed this leader' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to unfollow', text2: 'Please try again later' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {isOffline && (
        <View className="bg-gray-100 px-4 py-2 flex-row items-center gap-2">
          <Ionicons name="warning" size={16} color="#3b82f6" />
          <Text className="text-xs font-medium text-gray-800">
            {isSyncing ? 'Syncing offline changes...' : syncError ? 'Sync failed' : 'Offline mode'}
          </Text>
        </View>
      )}
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
            <LeadersSkeleton />
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
