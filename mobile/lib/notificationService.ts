import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'like' | 'comment' | 'reply' | 'follow' | 'message' | 'mention' | 'other';
  postId?: string;
  commentId?: string;
  userId?: string;
  actorName?: string;
  [key: string]: any;
}

interface RegisterTokenParams {
  token: string;
  userId: string;
  axiosInstance: any;
}

class NotificationService {
  private notificationListener: any = null;
  private responseListener: any = null;
  private lastToken: string | null = null;

  /**
   * Register for push notifications
   */
  async registerForPushNotificationsAsync(
    userId: string,
    axiosInstance: any,
  ): Promise<string | null> {
    try {
      // Check device capability
      if (!Device.isDevice) {
        console.warn('Notifications require a physical device');
        return null;
      }

      // Get notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push notification permission');
        return null;
      }

      // Get Expo push token
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId || Constants?.expoConfig?.extra?.projectId;

      if (!projectId) {
        throw new Error('Project ID not found in app config');
      }

      // Setup notification channels and iOS badge handling
      if (Platform.OS === 'android') {
        // Android notification channel setup (Android 8.0+)
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
            enableLights: true,
            enableVibrate: true,
          });
        } catch (channelError) {
          console.warn('Error setting notification channel:', channelError);
          // Continue anyway - the channel might already exist
        }
      } else if (Platform.OS === 'ios') {
        // iOS notification setup - request notification permissions
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          console.log('iOS notification permission status:', status);
        } catch (iosError) {
          console.warn('Error requesting iOS notification permission:', iosError);
        }
      }

      // Get Expo push token with retry logic
      let token;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          token = await Notifications.getExpoPushTokenAsync({ projectId });
          if (token?.data) {
            break;
          }
        } catch (tokenError: any) {
          retries++;
          if (retries >= maxRetries) {
            throw tokenError;
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }

      if (!token?.data) {
        throw new Error('Failed to get push token after retries');
      }

      console.log('Successfully obtained push token:', token.data);

      // Register token with backend
      await this.registerTokenWithBackend(
        {
          token: token.data,
          userId,
          axiosInstance,
        },
      );

      // Store token locally
      this.lastToken = token.data;
      await AsyncStorage.setItem('pushToken', token.data);

      return token.data;
    } catch (error: any) {
      console.error('Error registering for push notifications:', error);
      
      // Log specific Firebase errors
      if (error?.message?.includes('FirebaseApp')) {
        console.error('Firebase not initialized. Make sure google-services.json is properly configured.');
      }
      
      return null;
    }
  }

  /**
   * Register token with backend API
   */
  private async registerTokenWithBackend({
    token,
    userId,
    axiosInstance,
  }: RegisterTokenParams): Promise<void> {
    try {
      const response = await axiosInstance.post('/users/me/push-token', { token });
      console.log('Token registered with backend:', response.data);
    } catch (error: any) {
      console.error('Error registering token with backend:', error.response?.data || error.message);
      // Don't throw, as the app should continue to work even if token registration fails
    }
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void,
  ): void {
    // Listen for notifications while app is open
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        onNotificationReceived?.(notification);
      },
    );

    // Listen for notification taps
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        onNotificationResponse?.(response);
      },
    );
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Unregister push token from backend
   */
  async unregisterPushToken(token: string, axiosInstance: any): Promise<void> {
    try {
      await axiosInstance.delete('/users/me/push-token', {
        data: { token },
      });
      console.log('Token unregistered from backend');
      await AsyncStorage.removeItem('pushToken');
    } catch (error: any) {
      console.error('Error unregistering token:', error.response?.data || error.message);
    }
  }

  /**
   * Get stored push token
   */
  async getStoredToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('pushToken');
      return token;
    } catch (error) {
      console.error('Error retrieving push token:', error);
      return null;
    }
  }

  /**
   * Clear all push tokens when logging out
   */
  async clearPushToken(axiosInstance: any): Promise<void> {
    try {
      const token = await this.getStoredToken();
      if (token) {
        await this.unregisterPushToken(token, axiosInstance);
      }
    } catch (error) {
      console.error('Error clearing push token:', error);
    }
  }

  /**
   * Handle notification data and navigate
   */
  handleNotificationData(data: NotificationData): any {
    const { type, postId, commentId, userId, ...rest } = data;

    const navigationParams: any = {
      type,
      ...rest,
    };

    if (postId) {
      navigationParams.postId = postId;
    }
    if (commentId) {
      navigationParams.commentId = commentId;
    }
    if (userId) {
      navigationParams.userId = userId;
    }

    return navigationParams;
  }

  /**
   * Badge management
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Get last notification received
   */
  getLastToken(): string | null {
    return this.lastToken;
  }
}

export default new NotificationService();
