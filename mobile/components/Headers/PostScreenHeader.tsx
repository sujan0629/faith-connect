import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface Props {
  title: string;
}

export const PostScreenHeader = ({ title }: Props) => {
  const router = useRouter();

  return (
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

        <Pressable className="w-16 items-end">
          <Ionicons name="ellipsis-horizontal" size={24} color="#111111" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
