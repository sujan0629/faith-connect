import { View, Pressable, Text, Share, ActivityIndicator } from "react-native";
import { useFollowStore } from "../../stores/followStore";
import { useState } from "react";
import { useRouter } from "expo-router";

interface ProfileActionsProps {
  isFollowing?: boolean;
  onFollowPress?: () => void;
  onMessagePress?: () => void;
  onSharePress?: () => void;
  onContactPress?: () => void;
  onEditPress?: () => void;
  isOwnProfile?: boolean;
  isLeader?: boolean;
  viewerIsLeader?: boolean;
  leaderId?: string;
  profileName?: string;
  profileUsername?: string;
}

export const ProfileActions = ({
  isFollowing = false,
  onFollowPress,
  onMessagePress,
  onSharePress,
  onContactPress,
  onEditPress,
  isOwnProfile = false,
  isLeader = false,
  viewerIsLeader = false,
  leaderId,
  profileName = "Profile",
  profileUsername = "user",
}: ProfileActionsProps) => {
  const [shareLoading, setShareLoading] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const { isFollowing: checkFollowing } = useFollowStore()
  const router = useRouter()
  const followingFromStore = leaderId ? checkFollowing(leaderId) : isFollowing

  const handleShare = async () => {
    try {
      setShareLoading(true)
      await Share.share({
        message: `Check out ${profileName}'s profile on FaithConnect! Follow them to see their updates.`,
        url: `faithconnect://profile/${leaderId || profileUsername}`,
        title: `${profileName}'s Profile`,
      })
    } catch (error) {
      console.error('Share error:', error)
    } finally {
      setShareLoading(false)
    }
  }

  const handleInvite = async () => {
    try {
      setInviteLoading(true)
      await Share.share({
        message: `Join me on FaithConnect! A community for spiritual growth and connection. Download now!`,
        url: `https://faithconnect.app`,
        title: `Join FaithConnect`,
      })
    } catch (error) {
      console.error('Invite error:', error)
    } finally {
      setInviteLoading(false)
    }
  }

  const handleDashboard = () => {
    router.push('/profile/dashboard')
  }

  if (isOwnProfile) {
    return (
      <View className="bg-white px-4 ml-4 pb-8">
        <View className="flex-row items-center justify-center">
          <Pressable
            onPress={() => router.push("/profile/edit")}
            className="flex-1 items-center py-2 rounded-lg mr-2 bg-gray-100"
          >
            <Text className="text-sm font-semibold text-gray-900">Edit Profile</Text>
          </Pressable>
          <Pressable
            onPress={handleShare}
            className="flex-1 items-center py-2 rounded-lg mx-2 bg-gray-100"
          >
            {shareLoading ? (
              <ActivityIndicator size="small" color="#111111" />
            ) : (
              <Text className="text-sm font-semibold text-gray-900">Share Profile</Text>
            )}
          </Pressable>
          {isLeader ? (
            <Pressable
              onPress={handleDashboard}
              className="flex-1 items-center py-2 rounded-lg ml-2 bg-blue-200"
            >
              <Text className="text-sm font-semibold text-black">Dashboard</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleInvite}
              className="flex-1 items-center py-2 rounded-lg ml-2 bg-gray-100"
            >
              {inviteLoading ? (
                <ActivityIndicator size="small" color="#111111" />
              ) : (
                <Text className="text-sm font-semibold text-gray-900">Invite</Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white px-4 ml-4 pb-8">
      <View className="flex-row items-center mr-4 justify-center">
        {viewerIsLeader && isLeader ? (
          // Leader viewing another leader: Message, Dashboard, Share Profile
          <>
            <Pressable
              onPress={onMessagePress}
              className="flex-1 items-center py-2 rounded-lg mr-2 bg-gray-100"
            >
              <Text className="text-sm font-semibold text-gray-900">Message</Text>
            </Pressable>
            <Pressable
              onPress={handleDashboard}
              className="flex-1 items-center py-2 rounded-lg mx-2 bg-blue-500"
            >
              <Text className="text-sm font-semibold text-white">Dashboard</Text>
            </Pressable>
            <Pressable
              onPress={handleShare}
              className="flex-1 items-center py-2 rounded-lg ml-2 bg-gray-100"
            >
              {shareLoading ? (
                <ActivityIndicator size="small" color="#111111" />
              ) : (
                <Text className="text-sm font-semibold text-gray-900">Share Profile</Text>
              )}
            </Pressable>
          </>
        ) : viewerIsLeader && !isLeader ? (
          // Leader viewing worshipper: Message, Contact, Share Profile
          <>
            <Pressable
              onPress={onMessagePress}
              className="flex-1 items-center py-2 rounded-lg mr-2 bg-gray-100"
            >
              <Text className="text-sm font-semibold text-gray-900">Message</Text>
            </Pressable>
            <Pressable
              onPress={handleInvite}
              className="flex-1 items-center py-2 rounded-lg mx-2 bg-gray-100"
            >
              {inviteLoading ? (
                <ActivityIndicator size="small" color="#111111" />
              ) : (
                <Text className="text-sm font-semibold text-gray-900">Invite</Text>
              )}
            </Pressable>
            <Pressable
              onPress={handleShare}
              className="flex-1 items-center py-2 rounded-lg ml-2 bg-gray-100"
            >
              {shareLoading ? (
                <ActivityIndicator size="small" color="#111111" />
              ) : (
                <Text className="text-sm font-semibold text-gray-900">Share Profile</Text>
              )}
            </Pressable>
          </>
        ) : (
          // Default: Follow, Message, Share Profile
          <>
            <Pressable
              onPress={onFollowPress}
              className={`flex-1 items-center py-2 rounded-lg mr-2 ${
                followingFromStore ? "bg-gray-100" : "bg-blue-500"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  followingFromStore ? "text-gray-900" : "text-white"
                }`}
              >
                {followingFromStore ? "Following" : "Follow"}
              </Text>
            </Pressable>
            <Pressable
              onPress={onMessagePress}
              className="flex-1 items-center py-2 rounded-lg mx-2 bg-gray-100"
            >
              <Text className="text-sm font-semibold text-gray-900">Message</Text>
            </Pressable>
            <Pressable
              onPress={handleInvite}
              className="flex-1 items-center py-2 rounded-lg ml-2 bg-gray-100"
            >
              {inviteLoading ? (
                <ActivityIndicator size="small" color="#111111" />
              ) : (
                <Text className="text-sm font-semibold text-gray-900">Invite</Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};
