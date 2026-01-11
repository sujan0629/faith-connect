import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SolidButton } from "../../components/Buttons/SolidButton";
import { TextField } from "../../components/InputFields/TextField";
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../components/ToastConfig';
import { api } from "../../api/axios";
import { useAuthStore } from "../../stores/authStore";

interface RouteParams {
  email?: string;
}

export default function PasswordLoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email = "" } = params;
  const setAuth = useAuthStore((s) => s.setAuth);

  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handlePasswordLogin = async () => {
    if (!password.trim()) {
      Alert.alert("Password required", "Please enter your password.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const { data } = await api.post('/auth/password-login', { email, password });
      setAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });

      setIsAuthenticating(true);
      router.replace(data.user?.hasProfile ? '/(tabs)/home' : '/onboarding/profile');
      setTimeout(() => {
        Toast.show({ type: 'success', text1: 'Login successful!', text2: 'Welcome back.' });
        setIsAuthenticating(false);
      }, 400);
    } catch (error: any) {
      Alert.alert("Login Failed", error?.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 mt-2 py-3 border-b border-gray-200">
        <View className="flex-row items-center mt-2 mb-2 justify-between">
          <Pressable onPress={() => router.back()} className="w-10">
            <MaterialCommunityIcons name="chevron-left" size={26} color="#222" />
          </Pressable>

          <View className="flex-1 items-center justify-center px-2">
            <Text className="text-dark text-lg font-semibold text-center" numberOfLines={1}>
              Password
            </Text>
          </View>

          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          <Text className="text-dark text-xl font-bold text-center mb-3">Enter your password</Text>
          <Text className="text-textSecondary text-xs text-center mb-4">To access your account</Text>
          <Text className="text-dark text-base font-semibold text-center mb-4">{email || "your email"}</Text>

          <TextField
            label=""
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            rightIcon={
              <MaterialCommunityIcons
                name={passwordVisible ? "eye-off" : "eye"}
                size={22}
                color="#222"
              />
            }
            onRightIconPress={() => setPasswordVisible(!passwordVisible)}
          />

          <SolidButton
            label="Log In"
            onPress={handlePasswordLogin}
            variant="blue"
            loading={isLoggingIn}
                        style={{ marginTop: 20, paddingVertical: 12 }}

          />

        
          <View className="mt-4">
            <Pressable onPress={() => {}} className="py-2">
              <Text className="text-center text-xs text-gray-500">
                Dont remember your password? <Text className="text-primary font-semibold">Reset your password</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {isAuthenticating && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#EDF5F0",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999999,
            elevation: 999999,
          }}
        >
          <ActivityIndicator size="large" color="#1C555E" />
        </View>
      )}
      <Toast config={toastConfig}/>
    </SafeAreaView>
  );
};;;;;
