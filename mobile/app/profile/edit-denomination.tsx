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

const denominations: Record<string, string[]> = {
  Christianity: [
    "Catholic",
    "Protestant",
    "Orthodox",
    "Evangelical",
    "Pentecostal",
    "Anglican",
    "Non-denominational",
    "Other Christian",
  ],
  Islam: [
    "Sunni",
    "Shia",
    "Ibadi",
    "Sufi",
    "Ahmadiyya",
    "Other Islamic",
  ],
  Buddhism: [
    "Theravāda",
    "Mahāyāna",
    "Vajrayāna",
    "Zen",
    "Tibetan",
    "Pure Land",
    "Other Buddhist",
  ],
  Hinduism: [
    "Vaishnavism",
    "Shaivism",
    "Shaktism",
    "Smartism",
    "ISKCON / Hare Krishna",
    "General Hindu",
  ],
  Sikhism: ["Khalsa", "Nihang", "Namdhari", "General Sikh"],
  Judaism: [
    "Orthodox",
    "Conservative",
    "Reform",
    "Reconstructionist",
    "Hasidic",
    "Secular / Cultural",
    "Other Jewish",
  ],
  "Bahá'í Faith": ["Bahá'í (General)"],
  Jainism: [
    "Digambara",
    "Śvētāmbara",
    "Sthānakavāsī",
    "Terāpanth",
    "General Jain",
  ],
  Shinto: [
    "Shrine Shinto",
    "Sect Shinto",
    "Folk Shinto",
    "State Shinto",
    "General Shinto",
  ],
  Taoism: [
    "Zhengyi",
    "Quanzhen",
    "Shangqing",
    "Lingbao",
    "Folk Taoism",
    "General Taoist",
  ],
  Others: [
    "Spiritual / Non-denominational",
    "Interfaith",
    "Indigenous / Folk belief",
    "Prefer not to say",
  ],
};

export default function EditDenominationScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [denomination, setDenomination] = useState(
    user?.denomination || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faith = user?.faith || "Christianity";
  const options = denominations[faith as keyof typeof denominations] || [];

  const handleSave = async () => {
    if (!denomination) {
      Toast.show({
        type: "error",
        text1: "Denomination required",
        text2: "Please select a denomination",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.patch("/users/me", { denomination });
      if (res.data) {
        await updateUser(res.data);
        Toast.show({
          type: "success",
          text1: "Denomination updated successfully",
        });
        router.back();
      }
    } catch (error: any) {
      console.error("Update error:", error);
      Toast.show({
        type: "error",
        text1: "Error updating denomination",
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
          Edit Denomination
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-8">
        <Text className="text-xl font-bold text-gray-900">
          Change your denomination?
        </Text>
        <Text className="mt-2 text-sm text-gray-600">
          Choose your specific tradition within <Text className="font-medium">{faith}</Text> for better connections.
        </Text>

        <View className="mt-8 flex-row flex-wrap gap-3">
          {options.map((item) => (
            <Pressable
              key={item}
              onPress={() => setDenomination(item)}
              className={`rounded-full px-4 py-2 border ${
                denomination === item
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  denomination === item ? "text-white" : "text-gray-700"
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
