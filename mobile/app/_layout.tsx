import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { toastConfig } from "../components/ToastConfig";
import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform } from "react-native";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
  Roboto_700Bold_Italic,
} from "@expo-google-fonts/roboto";
import * as SplashScreen from "expo-splash-screen";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "../components/ErrorBoundary";
import notificationService from "../lib/notificationService";
import { verifyFirebaseSetup } from "../lib/firebaseSetup";
import { useAuthStore } from "../stores/authStore";
import { api } from "../api/axios";
import backendKeepAlive from "../lib/backendKeepAlive";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
    Roboto_700Bold_Italic,
  });

  const { user } = useAuthStore();

   
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Start backend keep-alive service on app launch
  useEffect(() => {
    backendKeepAlive.startBackendKeepAlive()

    return () => {
      backendKeepAlive.stopBackendKeepAlive()
    }
  }, [])

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#FFFFFF").catch(() => {});
      // Defer Firebase verification to not block initial load
      // Run it after a short delay so it doesn't impact app startup
      const timer = setTimeout(() => {
        verifyFirebaseSetup().then((result) => {
          if (!result.isConfigured) {
            console.error("Firebase not properly configured:", result.issues);
          }
        });
      }, 3000); // Defer for 3 seconds after app loads
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Initialize push notifications when user is authenticated
  // Deferred to avoid blocking initial render
  useEffect(() => {
    if (!user?.id) return;
    
    // Defer initialization to after app has fully rendered
    const timer = setTimeout(async () => {
      try {
        // Register for push notifications
        await notificationService.registerForPushNotificationsAsync(
          user.id,
          api,
        );

        // Setup notification listeners
        notificationService.setupNotificationListeners(
          (notification) => {
            // Handle notification when app is open
            console.log("Notification received:", notification);
            Toast.show({
              type: "info",
              text1: notification.request.content.title || "New Notification",
              text2: notification.request.content.body || "New message",
            });
          },
          (response) => {
            // Handle notification tap
            const data = response.notification.request.content.data;
            if (data && data.type) {
              console.log("Navigating from notification:", data);
              // Handle navigation based on notification type
            }
          },
        );
      } catch (error) {
        console.error("Error initializing push notifications:", error);
      }
    }, 2000); // Defer by 2 seconds to not block initial render

    // Cleanup
    return () => {
      clearTimeout(timer);
      notificationService.removeNotificationListeners();
    };
  }, [user?.id]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }} className="flex-1 bg-white">
        <KeyboardProvider>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#FFFFFF" },
                gestureEnabled: false,
              }}
            >
              <Stack.Screen name="index" options={{ gestureEnabled: false }} />
              <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
              <Stack.Screen name="magic-login" options={{ gestureEnabled: false }} />
            </Stack>
            <Toast config={toastConfig} position="top" topOffset={60} />
          </SafeAreaProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
