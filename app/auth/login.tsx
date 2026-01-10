import React, { useState } from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from '../../stores/authStore'
import { SolidButton } from "../../components/Buttons/SolidButton";
import { TextField } from "../../components/InputFields/TextField";
import { useRouter } from "expo-router";
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../components/ToastConfig';

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [magicLinkSending, setMagicLinkSending] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);

  const handlePasswordLogin = () => {
    router.push({ pathname: "/auth/PasswordLoginScreen", params: { email: email.trim() } });
  };

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email to continue.");
      return;
    }

    setMagicLinkError(null);
    setMagicLinkSending(true);

    try {
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push({ pathname: "/auth/EmailSentScreen", params: { email: email.trim(), isSignup: "false" } });
    } catch (error: any) {
      setMagicLinkError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setMagicLinkSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 mt-2 py-3 border-b border-gray-200">
        <View className="flex-row items-center mt-2 mb-2 justify-between">
          <Pressable onPress={() => router.back()} className="w-10 items-start">
            <MaterialCommunityIcons name="chevron-left" size={24} color="#222" />
          </Pressable>
          <View className="flex-1 items-center justify-center px-2">
            <Text className="text-dark text-xl font-bold text-center" numberOfLines={1}>
              Sign in
            </Text>
          </View>
          <View className="w-10" />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 pt-6 pb-8">
            <Text className="text-dark text-xl font-bold mb-1 mt-2 text-center">Enter your email</Text>
            <Text className="text-xs mt-2 mb-4 text-center">
              We'll send you a magic link to sign in.
            </Text>

            <TextField
              label=""
              placeholder="name@example.com"
              value={email}
              onChangeText={(value) => {
                const cleanedValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");
                setEmail(cleanedValue.toLowerCase());
              }}
            />

            <SolidButton
              label="Sign in with Email"
              onPress={handleSendMagicLink}
              variant="blue"
              loading={magicLinkSending}
              style={{ marginTop: 20, paddingVertical: 14 }}
            />

            <View className="flex-row items-center justify-center mt-6 mb-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="text-gray-400 text-sm font-medium mx-3">OR</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {}}
                className="flex-1 rounded-xl border border-gray-300 bg-white py-3 items-center justify-center flex-row"
              >
                <MaterialCommunityIcons name="google" size={20} color="#333" />
                <Text className="text-[#333] text-sm font-semibold ml-2">Google</Text>
              </Pressable>

              <Pressable
                onPress={() => {}}
                className="flex-1 rounded-xl border border-gray-300 bg-white py-3 items-center justify-center flex-row"
              >
                <MaterialCommunityIcons name="microsoft" size={20} color="#333" />
                <Text className="text-[#333] text-sm font-semibold ml-2">Microsoft</Text>
              </Pressable>

              <Pressable
                onPress={() => {}}
                className="flex-1 rounded-xl border border-gray-300 bg-white py-3 items-center justify-center flex-row"
              >
                <MaterialCommunityIcons name="slack" size={20} color="#333" />
                <Text className="text-[#333] text-sm font-semibold ml-2">Slack</Text>
              </Pressable>
            </View>
            <View className="px-2 mt-4">
              <Text className="text-xs text-gray-500 text-center leading-5 mb-3">
                By continuing, you agree to our <Text className="font-semibold">Terms of Service</Text> and <Text className="font-semibold">Privacy Policy</Text>.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast config={toastConfig} topOffset={80} />
    </SafeAreaView>
  );
};;
