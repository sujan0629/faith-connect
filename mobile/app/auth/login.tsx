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
import { useDebouncedRouter } from "../../hooks/useDebounce";
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../components/ToastConfig';
import { api } from "../../api/axios";
import { CheckEmailSchema } from '@faithconnect/shared';
import { useZodValidation } from '../../hooks/useZodValidation';

export default function Login() {
  const router = useDebouncedRouter();
  const { isAuthenticated, user, rolePreference } = useAuthStore()
  const [email, setEmail] = useState("");
  const [magicLinkSending, setMagicLinkSending] = useState(false);
  const { errors, validateField } = useZodValidation(CheckEmailSchema);

  // Redirect authenticated users away from login
   
  React.useEffect(() => {
    if (isAuthenticated && user?.onboardingCompleted) {
      router.replace('/(tabs)/home')
    }
  }, [isAuthenticated, user?.onboardingCompleted])

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.length > 0) {
      validateField('email', text);
    }
  };

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email to continue.");
      return;
    }

    // Validate email before sending
    const error = validateField('email', email.trim());
    if (error) {
      Toast.show({ type: 'error', text1: 'Invalid email', text2: error });
      return;
    }

    // clear any previous UI errors via toast
    setMagicLinkSending(true);

    try {
      const { data } = await api.post('/auth/check-email', { email: email.trim(), role: rolePreference });
      if (data.status === 'magic-link-sent') {
        router.push({ pathname: "/auth/EmailSentScreen", params: { email: email.trim(), isSignup: "false" } });
        setTimeout(() => {
          Toast.show({ type: 'success', text1: 'Magic link sent', text2: 'Check your email' });
        }, 300);
      } else if (data.status === 'role-mismatch') {
        const roleName = data.role === 'leader' ? 'Leader' : 'Worshiper';
        Alert.alert(
          "Role Mismatch",
          `This email is registered as a ${roleName} account.`,
          [
            {
              text: 'Back',
              onPress: () => {
                router.replace('/');
              },
            },
            { text: 'Cancel' },
          ],
        );
      } else if (data.status === 'signup-incomplete') {
        router.push({ pathname: "/auth/EmailSentScreen", params: { email: email.trim(), isSignup: "true" } });
        setTimeout(() => {
          Toast.show({ type: 'info', text1: 'Finish your signup', text2: 'Check your email for the magic link' });
        }, 300);
      } else if (data.status === 'not-found') {
        Alert.alert(
          "This email isn't registered",
          "Do you want to create a new FaithConnect account?",
          [
            { text: 'No' },
            {
              text: 'Yes',
              onPress: async () => {
                try {
                  await api.post('/auth/request-signup', { email: email.trim(), role: useAuthStore.getState().rolePreference });
                  router.push({ pathname: "/auth/EmailSentScreen", params: { email: email.trim(), isSignup: "true" } });
                  setTimeout(() => {
                    Toast.show({ type: 'success', text1: 'Magic link sent!', text2: 'Check your email to complete signup' });
                  }, 300);
                } catch (err: any) {
                  Toast.show({ type: 'error', text1: 'Signup failed', text2: err?.response?.data?.message || 'Please try again' });
                }
              },
            },
          ],
        );
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Magic link failed', text2: error?.message || 'Something went wrong. Please try again.' })
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
              We&apos;ll send you a magic link to sign in.
            </Text>

            <TextField
              label=""
              placeholder="name@example.com"
              value={email}
              onChangeText={handleEmailChange}
            />
            {errors.email ? (
              <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
            ) : null}

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
                onPress={() => Toast.show({ type: 'info', text1: 'Available shortly', text2: 'Google login will be available in Phase 2' })}
                className="flex-1 rounded-xl border border-gray-300 bg-white py-3 items-center justify-center flex-row"
              >
                <MaterialCommunityIcons name="google" size={20} color="#333" />
                <Text className="text-[#333] text-sm font-semibold ml-2">Google</Text>
              </Pressable>

              <Pressable
                onPress={() => Toast.show({ type: 'info', text1: 'Available shortly', text2: 'Microsoft login will be available in Phase 2' })}
                className="flex-1 rounded-xl border border-gray-300 bg-white py-3 items-center justify-center flex-row"
              >
                <MaterialCommunityIcons name="microsoft" size={20} color="#333" />
                <Text className="text-[#333] text-sm font-semibold ml-2">Microsoft</Text>
              </Pressable>

              <Pressable
                onPress={() => Toast.show({ type: 'info', text1: 'Available shortly', text2: 'Slack login will be available in Phase 2' })}
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
}