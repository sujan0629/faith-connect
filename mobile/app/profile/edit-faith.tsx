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

const faiths = [
  "Christianity",
  "Islam",
  "Hinduism",
  "Buddhism",
  "Sikhism",
  "Judaism",
  "Bahá'í Faith",
  "Jainism",
  "Shinto",
  "Taoism",
  "Others",
];

export default function EditFaithScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [faith, setFaith] = useState(user?.faith || "Christianity");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.patch("/users/me", { faith });
      if (res.data) {
        await updateUser(res.data);
        Toast.show({
          type: "success",
          text1: "Faith updated successfully",
        });
        router.back();
      }
    } catch (error: any) {
      console.error("Update error:", error);
      Toast.show({
        type: "error",
        text1: "Error updating faith",
        text2: error?.response?.data?.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
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
          Edit Faith
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-8">
        <Text className="text-xl font-bold text-gray-900">Change your faith?</Text>
        <Text className="mt-2 text-sm text-gray-600">
          Select the spiritual path you follow to connect with like-minded community.
        </Text>

        <View className="mt-8 flex-row flex-wrap gap-3">
          {faiths.map((item) => (
            <Pressable
              key={item}
              onPress={() => setFaith(item)}
              className={`rounded-full px-6 py-3 border ${
                faith === item
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  faith === item ? "text-white" : "text-gray-700"
                }`}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
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
