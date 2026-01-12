import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { PostActionModal } from "../Feed/PostActionModal";

interface Props {
  title: string;
  onReport?: () => void;
  onBlock?: () => void;
}

export const PostScreenHeader = ({ title, onReport, onBlock }: Props) => {
  const router = useRouter();
  const [showActionMenu, setShowActionMenu] = useState(false);

  return (
    <>
      <SafeAreaView edges={["top"]} className="bg-white">
        <View className="flex-row border-b border-[#f0f0f0] items-center justify-between bg-white px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-2"
          >
            <Ionicons name="chevron-back" size={24} color="#111111" />
          </Pressable>

          <Text className="flex-1 text-center text-xl font-bold text-[#111111]">
           {" "}{" "} Post
          </Text>

          <Pressable 
            className="w-16 items-end"
            onPress={() => setShowActionMenu(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#111111" />
          </Pressable>
        </View>
      </SafeAreaView>

      <PostActionModal
        visible={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        onReport={() => {
          setShowActionMenu(false);
          onReport?.();
        }}
        onBlock={() => {
          setShowActionMenu(false);
          onBlock?.();
        }}
      />
    </>
  );
};
