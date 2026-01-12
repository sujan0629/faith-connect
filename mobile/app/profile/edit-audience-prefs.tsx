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

const audiencePreferences = ["Youth", "Adults", "Families", "General"];

export default function EditAudiencePrefsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [audiencePrefs, setAudiencePrefs] = useState<string[]>(
    user?.audiencePrefs || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.patch("/users/me", { audiencePrefs });
      if (res.data) {
        await updateUser(res.data);
        Toast.show({
          type: "success",
          text1: "Audience preferences updated successfully",
        });
        router.back();
      }
    } catch (error: any) {
      console.error("Update error:", error);
      Toast.show({
        type: "error",
        text1: "Error updating preferences",
        text2: error?.response?.data?.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePref = (pref: string) => {
    if (audiencePrefs.includes(pref)) {
      setAudiencePrefs(audiencePrefs.filter((p) => p !== pref));
    } else {
      setAudiencePrefs([...audiencePrefs, pref]);
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
          Audience Preferences
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-8">
        <Text className="text-xl font-bold text-gray-900">
          Change your audience preferences
        </Text>
        <Text className="mt-2 text-sm text-gray-600">Tell us who you primarily create content for.</Text>

        <View className="mt-8">
          {audiencePreferences.map((pref) => {
            const isSelected = audiencePrefs.includes(pref);
            return (
              <Pressable
                key={pref}
                onPress={() => togglePref(pref)}
                className="flex-row items-center p-4 rounded-xl border border-gray-100 mb-4"
              >
                <View
                  className={`w-6 h-6 rounded-lg border-2 mr-4 flex items-center justify-center ${
                    isSelected
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {isSelected && (
                    <Text className="text-white text-sm font-bold">✓</Text>
                  )}
                </View>
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  {pref}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-6 text-xs text-gray-500 text-center">
          Select all that apply
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
