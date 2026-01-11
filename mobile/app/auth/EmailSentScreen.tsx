import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  Platform,
  ActionSheetIOS,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SolidButton } from "@/components/Buttons/SolidButton";
import emailsent from '../../assets/images/emailsent.png';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../components/ToastConfig';
import { useEffect } from 'react';

interface RouteParams {
  email?: string;
  isSignup?: string;
}

const emailApps = [
  { name: "Gmail", iosScheme: "googlegmail://", androidPackage: "com.google.android.gm", fallback: "https://mail.google.com" },
  { name: "Outlook", iosScheme: "ms-outlook://", androidPackage: "com.microsoft.office.outlook", fallback: "https://outlook.live.com" },
  { name: "Mail (iOS)", iosScheme: "message://", androidPackage: null, fallback: null, ios: true },
  { name: "Yahoo Mail", iosScheme: "ymail://", androidPackage: "com.yahoo.mobile.client.android.mail", fallback: "https://mail.yahoo.com" },
];

const openEmailApp = async (app: typeof emailApps[0]) => {
  try {
    if (Platform.OS === "ios") {
      const canOpen = await Linking.canOpenURL(app.iosScheme);
      if (canOpen) {
        await Linking.openURL(app.iosScheme);
      } else if (app.fallback) {
        await Linking.openURL(app.fallback);
      }
    } else {
      if (app.androidPackage) {
        const intentURL = `intent://#Intent;package=${app.androidPackage};end`;
        try {
          await Linking.openURL(intentURL);
          return;
        } catch (error) {
          // fall through to fallback handling
        }
      }
      if (app.fallback) {
        await Linking.openURL(app.fallback);
      }
    }
  } catch (error) {
    console.error(`Error opening ${app.name}:`, error);
  }
};

export default function EmailSentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email = "", isSignup = "false" } = params;
  const isSignupBool = isSignup === "true";

  useEffect(() => {
    if (!isSignupBool) {
      Toast.show({ type: 'success', text1: 'Magic link sent!', text2: 'Check your email to continue.' });
    }
  }, [isSignupBool]);

  const handleOpenEmailApp = () => {
    if (Platform.OS === "ios") {
      const options = ["Gmail", "Outlook", "Mail (iOS)", "Yahoo Mail", "Cancel"];
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: options.length - 1, title: "Choose Email App" },
        (buttonIndex) => {
          if (buttonIndex < emailApps.length) {
            openEmailApp(emailApps[buttonIndex]);
          }
        }
      );
      return;
    }

    openEmailApp(emailApps[0]);
  };

  const handleSecondaryAction = () => {
    if (isSignupBool) {
      router.push({ pathname: "/auth/VerifyCodeScreen", params: { email } });
    } else {
      router.push({ pathname: "/auth/PasswordLoginScreen", params: { email } });
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
            <Text className="text-dark text-lg font-bold text-center" numberOfLines={1}>
              Email Sent
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
        <View className="items-center">
          <View
            className="bg-light rounded-full items-center justify-center mb-8"
            style={{ width: 180, height: 150 }}
          >
            <Image
              source={emailsent}
              style={{ width: 250, height: 250 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-dark text-xl font-bold text-center mt-4 mb-3">Check your email!</Text>
          <Text className="text-xs text-center mb-4">We sent a confirmation link to</Text>
          <Text className="text-base mt-2 font-semibold text-center mb-2">{email || "your email"}</Text>

          <SolidButton
            label="Open your Email App"
            onPress={handleOpenEmailApp}
            variant="blue"
            style={{ marginTop: 20, paddingVertical: 12 }}

          />

          <View className="mt-4">
            <Pressable onPress={handleSecondaryAction}>
              <Text className="text-xs text-gray-500 text-center mt-2 leading-5">
                Having trouble? <Text className="text-primary font-medium">{isSignupBool ? "Enter verification code instead" : "Enter password instead"}</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
};;;;;

