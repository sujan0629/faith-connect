import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SolidButton } from "../../components/Buttons/SolidButton";
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../components/ToastConfig';

interface RouteParams {
  email?: string;
}

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email = "" } = params;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      Alert.alert("Code required", "Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);

    try {
      // TODO: Replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1200));

      Toast.show({ type: 'success', text1: 'Code verified!', text2: 'Please set your password.' });
      router.push({ pathname: "/auth/SetPasswordScreen", params: { email, verificationCode: fullCode } });
    } catch (error: any) {
      Alert.alert("Verification Failed", error?.message || "Invalid code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    Alert.alert("Code Sent", "A new verification code has been sent to your email.");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 mt-2 py-3 border-b border-gray-200">
        <View className="flex-row items-center mt-2 mb-2 justify-between">
          <Pressable onPress={() => router.back()} className="w-10" disabled={isVerifying}>
            <MaterialCommunityIcons name="chevron-left" size={26} color="#5F9598" />
          </Pressable>

          <View className="flex-1 items-center justify-center px-2">
            <Text className="text-dark text-lg font-semibold text-center" numberOfLines={1}>
              Verify Email
            </Text>
          </View>

          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
      >
        <View className="flex-1">
          <Text className="text-dark text-2xl font-bold text-center mb-3 mt-8">Enter verification code</Text>
          <Text className="text-textSecondary text-base text-center mb-2">We sent a 6-digit code to</Text>
          <Text className="text-dark text-base font-semibold text-center mb-12">{email || "your email"}</Text>

          <View className="mb-6">
            <View className="flex-row justify-center gap-3">
              {code.map((digit, index) => (
                <View
                  key={index}
                  className="bg-light rounded-xl border border-gray-300"
                  style={{ width: 50, height: 60 }}
                >
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    className="text-dark font-semibold text-2xl text-center"
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    autoFocus={index === 0}
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                    style={{ flex: 1 }}
                  />
                </View>
              ))}
            </View>
          </View>

          <SolidButton
            label="Verify & Continue"
            onPress={handleVerifyCode}
            variant="blue"
            loading={isVerifying}
          />

          <SolidButton
            label="Resend code"
            onPress={handleResendCode}
            variant="secondary"
          />
        </View>
      </ScrollView>
      <Toast config={toastConfig}/>
    </SafeAreaView>
  );
};;;;;
