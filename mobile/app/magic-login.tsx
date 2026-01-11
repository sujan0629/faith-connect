import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { api } from "../api/axios";
import { useAuthStore } from "../stores/authStore";

export default function MagicLoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token = "", email = "", code = "", signup = "" } = params;
  const setAuth = useAuthStore((s) => s.setAuth);
  const [status, setStatus] = useState<string>("Verifying magic link...");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verify = async () => {
      console.log('[MagicLogin] Params received:', { token, email, code, signup });
      
      if (!token || !email) {
        setStatus("Missing token or email in the link.");
        setIsLoading(false);
        return;
      }

      try {
        const isSignup = signup === "true";
        console.log('[MagicLogin] isSignup:', isSignup);
        
        if (isSignup) {
          // Signup flow - verify and get signupToken
          console.log('[MagicLogin] Calling /auth/verify-signup-magic');
          const { data } = await api.post("/auth/verify-signup-magic", { token, email, code });
          console.log('[MagicLogin] Success response:', data);
          router.replace({
            pathname: "/auth/SetPasswordScreen",
            params: { signupToken: data.signupToken, email: data.email },
          });
          setTimeout(() => {
            Toast.show({ type: "success", text1: "Email verified!", text2: "Create your password" });
          }, 300);
        } else {
          // Login flow - verify and get full auth
          console.log('[MagicLogin] Calling /auth/verify-magic');
          const { data } = await api.post("/auth/verify-magic", { token, email, code });
          console.log('[MagicLogin] Success response:', data);
          setAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
          router.replace(data.user?.hasProfile ? "/(tabs)/home" : "/onboarding/profile");
          setTimeout(() => {
            Toast.show({ type: "success", text1: "Signed in", text2: "Welcome back" });
          }, 400);
        }
      } catch (error: any) {
        console.log('[MagicLogin] Error caught:', error);
        console.log('[MagicLogin] Error response:', error?.response);
        console.log('[MagicLogin] Error message:', error?.response?.data?.message);
        setStatus(error?.response?.data?.message || "Link is invalid or expired.");
        setIsLoading(false);
      }
    };

    verify();
  }, [token, email, code, signup, router, setAuth]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      {isLoading ? (
        <>
          <ActivityIndicator size="large" color="#1C555E" />
          <Text className="mt-4 text-sm text-gray-700">{status}</Text>
        </>
      ) : (
        <>
          <Text className="text-sm text-center text-gray-800 mb-4">{status}</Text>
          <Pressable
            onPress={() => router.replace("/auth/login")}
            className="rounded-full bg-blue-500 px-5 py-3"
          >
            <Text className="text-white text-sm font-semibold">Back to login</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
