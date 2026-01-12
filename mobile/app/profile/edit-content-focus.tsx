import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../api/axios";
import Toast from "react-native-toast-message";
import { toastConfig } from "../../components/ToastConfig";

const contentFocusTags = [
  "Daily devotion",
  "Q&A",
  "Youth guidance",
  "Motivation",
  "Scripture explanation",
];

export default function EditContentFocusScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [contentFocus, setContentFocus] = useState<string[]>(
    user?.contentFocus || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.patch("/users/me", { contentFocus });
      if (res.data) {
        await updateUser(res.data);
        Toast.show({
          type: "success",
          text1: "Content focus updated successfully",
        });
        router.back();
      }
    } catch (error: any) {
      console.error("Update error:", error);
      Toast.show({
        type: "error",
        text1: "Error updating content focus",
        text2: error?.response?.data?.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (contentFocus.includes(tag)) {
      setContentFocus(contentFocus.filter((t) => t !== tag));
    } else if (contentFocus.length < 3) {
      setContentFocus([...contentFocus, tag]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 flex-1 text-center">
          Content Focus
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-8">
        <Text className="text-xl font-bold text-gray-900">Change your content focus</Text>
        <Text className="mt-2 text-sm text-gray-600">
          Select 1–3 areas that best describe your content <Text className="font-medium">(optional)</Text>.
        </Text>

        <View className="mt-8 flex-row flex-wrap gap-3">
          {contentFocusTags.map((tag) => {
            const isSelected = contentFocus.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`rounded-full px-4 py-2 border ${
                  isSelected
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-white" : "text-gray-700"
                  }`}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-6 text-xs text-gray-500">
          Selected: {contentFocus.length}/3
        </Text>
      </ScrollView>

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
      <Toast config={toastConfig} topOffset={80} />
    </SafeAreaView>
  );
}
