import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../api/axios";
import Toast from "react-native-toast-message";
import { toastConfig } from "../../components/ToastConfig";

export default function EditBioScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [bio, setBio] = useState(user?.bio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.patch("/users/me", { bio: bio.trim() });
      if (res.data) {
        await updateUser(res.data);
        Toast.show({
          type: "success",
          text1: "Bio updated successfully",
        });
        router.back();
      }
    } catch (error: any) {
      console.error("Update error:", error);
      Toast.show({
        type: "error",
        text1: "Error updating bio",
        text2: error?.response?.data?.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
          <Pressable onPress={() => router.back()} className="p-2">
            <Ionicons name="chevron-back" size={24} color="#000" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 flex-1 text-center">
            Edit Bio
          </Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 px-4 py-8">
          <Text className="text-xl font-bold text-gray-900">Change your bio</Text>
          <Text className="mt-2 text-sm text-gray-600">
            Share what makes you unique and what you&apos;re passionate about.
          </Text>

          <View className="mt-6">
            <TextInput
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 text-base min-h-[120px]"
              placeholder="Tell us about yourself"
              placeholderTextColor="#9CA3AF"
              value={bio}
              onChangeText={setBio}
              multiline
              textAlignVertical="top"
            />
            <Text className="mt-2 text-xs text-gray-500">
              {bio.length}/150
            </Text>
          </View>
        </View>

        <View className="p-6 border-t border-gray-50">
          <Pressable
            className="py-4 rounded-2xl bg-blue-500"
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-sm">
                Save
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <Toast config={toastConfig} topOffset={80} />
    </SafeAreaView>
  );
}
