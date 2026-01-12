import { View, Text, Pressable, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleBackPress = () => {
    router.back();
  };

  const handleEditPicture = () => {
    // TODO: Implement image picker for avatar
    console.log("Edit picture pressed");
  };

  const handleFieldPress = (field: string) => {
    switch (field) {
      case "name":
        router.push("/profile/edit-name");
        break;
      case "username":
        router.push("/profile/edit-username");
        break;
      case "bio":
        router.push("/profile/edit-bio");
        break;
      case "faith":
        router.push("/profile/edit-faith");
        break;
      case "denomination":
        router.push("/profile/edit-denomination");
        break;
      case "contentFocus":
        router.push("/profile/edit-content-focus");
        break;
      case "audiencePrefs":
        router.push("/profile/edit-audience-prefs");
        break;
      default:
        break;
    }
  };

  const FieldRow = ({
    label,
    value,
    onPress,
    isLast,
  }: {
    label: string;
    value: string;
    onPress: () => void;
    isLast?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      className="px-4 py-5 flex-row items-center justify-between"
    >
      <Text className="text-gray-600 font-medium text-sm flex-1">{label}</Text>
      <View className="flex-row items-center ml-2">
        <Text className="text-gray-700 text-base font-medium text-right max-w-[200px]">
          {value}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#999" className="ml-2" />
      </View>
    </Pressable>
  );

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm font-medium px-1 mb-3">{title}</Text>
      <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <Pressable onPress={handleBackPress} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 flex-1 text-center">
          Edit profile
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center mb-8">
          <View className="w-28 h-28 rounded-full bg-gray-200 items-center justify-center mb-4 overflow-hidden">
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-full h-full"
              />
            ) : (
              <Ionicons name="person-circle" size={112} color="#ccc" />
            )}
          </View>
          <Pressable onPress={handleEditPicture}>
            <Text className="text-blue-500 font-semibold text-base">Change photo</Text>
          </Pressable>
        </View>

        {/* Basic Info Section */}
        <Section title="Personal Info">
          <FieldRow
            label="Name"
            value={user?.name || "Add name"}
            onPress={() => handleFieldPress("name")}
          />
          <FieldRow
            label="Username"
            value={user?.username || "Add username"}
            onPress={() => handleFieldPress("username")}
            isLast
          />
        </Section>

        {/* Profile Details Section */}
        <Section title="Basic info">
          <FieldRow
            label="Bio"
            value={
              user?.bio || "Write a short description..."
            }
            onPress={() => handleFieldPress("bio")}
          />
          <FieldRow
            label="Faith"
            value={user?.faith || "Add faith"}
            onPress={() => handleFieldPress("faith")}
          />
          <FieldRow
            label="Denomination"
            value={user?.denomination || "Add denomination"}
            onPress={() => handleFieldPress("denomination")}
            isLast
          />
        </Section>

        {/* Others Section */}
        <Section title="Others">
          <FieldRow
            label="Content Focus"
            value={
              user?.contentFocus && user.contentFocus.length > 0
                ? user.contentFocus.join(", ")
                : "Add content focus"
            }
            onPress={() => handleFieldPress("contentFocus")}
          />
          <FieldRow
            label="Audience Preferences"
            value={
              user?.audiencePrefs && user.audiencePrefs.length > 0
                ? user.audiencePrefs.join(", ")
                : "Add preferences"
            }
            onPress={() => handleFieldPress("audiencePrefs")}
            isLast
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
