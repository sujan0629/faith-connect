import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Initialize Firebase for the app
 * Android uses Firebase/FCM, iOS uses APNs (handled by Expo automatically)
 * This is automatically called by Expo when google-services.json is present
 * But we can verify the setup here
 */
export const initializeFirebase = async (): Promise<boolean> => {
  try {
    // Firebase is automatically initialized by Expo on Android
    // when google-services.json is in the correct location
    
    if (Platform.OS === 'android') {
      // Check if we have the required configuration
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId) {
        console.warn('EAS Project ID not found in app config');
        return false;
      }

      console.log('Firebase initialization setup ready for Android');
      return true;
    }

    // iOS uses Apple Push Notification service (APNs) instead of Firebase
    // Expo handles APNs integration automatically
    if (Platform.OS === 'ios') {
      console.log('iOS push notifications configured - uses APNs (handled by Expo)');
      return true;
    }

    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
};

/**
 * Verify Firebase/APNs is properly set up for both platforms
 */
export const verifyFirebaseSetup = async (): Promise<{
  isConfigured: boolean;
  issues: string[];
}> => {
  const issues: string[] = [];
  let isConfigured = true;

  try {
    // Check if running on physical device or emulator
    const isPhysicalDevice = require('expo-device').isDevice;
    if (!isPhysicalDevice) {
      if (Platform.OS === 'android') {
        issues.push(
          'Running on Android emulator - FCM may not work. Use a physical device or emulator with Google Play Services.',
        );
      } else if (Platform.OS === 'ios') {
        issues.push(
          'Running on iOS Simulator - APNs requires a physical device to test.',
        );
      }
    }

    // Check project ID
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      issues.push('EAS Project ID not configured in app.json');
      isConfigured = false;
    }

    // Platform-specific checks
    if (Platform.OS === 'android') {
      console.log('✓ Android configuration - requires google-services.json');
    } else if (Platform.OS === 'ios') {
      console.log('✓ iOS configuration - uses APNs (Expo handles setup)');
    }

    // Log the configuration status
    if (isConfigured && issues.length === 0) {
      console.log('✓ Push notification setup appears to be correct');
    } else if (isConfigured && issues.length > 0) {
      console.warn('⚠ Setup has warnings but may still work:', issues);
    } else {
      console.error('✗ Setup is incomplete:', issues);
    }

    return {
      isConfigured,
      issues,
    };
  } catch (error) {
    console.error('Error verifying setup:', error);
    return {
      isConfigured: false,
      issues: ['Could not verify setup'],
    };
  }
};
