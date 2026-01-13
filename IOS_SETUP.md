# iOS Push Notifications Setup

## Overview
iOS push notifications work differently from Android. While Android uses Firebase Cloud Messaging (FCM), iOS uses Apple Push Notification service (APNs).

## Key Differences: Android vs iOS

| Aspect | Android | iOS |
|--------|---------|-----|
| Service | Firebase Cloud Messaging (FCM) | Apple Push Notification service (APNs) |
| Configuration | google-services.json | Apple Developer Account certificate |
| Setup Complexity | More complex | Complex but different |
| Token Type | FCM token | APNs device token |
| Backend Usage | Expo SDK to FCM | Expo SDK to APNs |

## iOS Setup Steps

### Step 1: Apple Developer Account
You need an Apple Developer Account (annual subscription ~$99)
- https://developer.apple.com/

### Step 2: Create APNs Certificate

1. **Go to Apple Developer Portal**
   - Log in to https://developer.apple.com/account/
   
2. **Navigate to Certificates**
   - Certificates, Identifiers & Profiles
   - Select "Certificates"
   - Click "+" to create a new certificate

3. **Select APNs Certificate Type**
   - Choose "Apple Push Notification service SSL (Sandbox & Production)"
   - Click "Continue"

4. **Select App ID**
   - Select the App ID for `com.faithconnect.sujan0629`
   - If it doesn't exist, create it first

5. **Upload Certificate Signing Request (CSR)**
   - Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
   - Save to file
   - Upload the CSR file in Apple Developer Portal
   - Download the certificate

6. **Export as P8 File**
   - This is the private key format APNs uses
   - Or export as P12 and convert

### Step 3: Configure in EAS Build

Create or update `eas.json` in your project root:

```json
{
  "build": {
    "preview": {
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "image": "latest"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "password": "@:APPLE_APP_SPECIFIC_PASSWORD:",
        "appIdentifier": "com.faithconnect.sujan0629"
      }
    }
  }
}
```

### Step 4: Configure APNs in Expo

You have two options:

**Option A: Using Expo Dashboard (Recommended)**

1. Go to https://expo.dev/
2. Select your project
3. Go to "Build" → "iOS"
4. Click "Configure"
5. Upload your APNs certificate (P8 or P12 file)

**Option B: Using EAS CLI**

```bash
eas credentials
# Follow prompts to set up iOS push notification credentials
```

### Step 5: Update app.json

The app.json has been updated with iOS configuration:

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.faithconnect.sujan0629",
  "infoPlist": {
    "NSCameraUsageDescription": "...",
    "NSPhotoLibraryUsageDescription": "...",
    "NSMicrophoneUsageDescription": "...",
    "ITSAppUsesNonExemptEncryption": false,
    "UIBackgroundModes": [
      "remote-notification"  // ← Required for push notifications
    ]
  }
}
```

## iOS Testing

### Physical Device (Recommended)
```bash
cd mobile
eas build --platform ios
# or
expo run:ios
```

### iOS Simulator Limitations
- APNs doesn't work on iOS Simulator
- Can only test on physical device
- This is Apple's limitation, not Expo

## How iOS Notifications Work

```
1. App starts on iOS device
   └─ Requests user permission for notifications
   
2. User grants permission
   └─ Device registers with APNs

3. APNs generates device token
   └─ Expo gets this token
   
4. Token sent to backend
   └─ Backend stores it
   
5. Backend sends notification
   └─ Uses Expo SDK
   └─ Expo sends to APNs
   └─ APNs sends to device
   
6. Device receives notification
   └─ iOS system displays it
   └─ User taps it
   └─ notificationService handles navigation
```

## Certificate Renewal

APNs certificates expire after 1 year. You'll need to:

1. Generate a new certificate from Apple Developer Portal
2. Upload the new certificate to Expo
3. Rebuild the app

Set a reminder for certificate renewal!

## Troubleshooting iOS Notifications

### Error: "APNs certificate not configured"
- ✓ Ensure APNs certificate is uploaded to Expo
- ✓ Check certificate hasn't expired
- ✓ Rebuild the app with new certificate

### Error: "Push notification permission denied"
- ✓ User didn't grant permission
- ✓ App is running in Sandbox (check notification settings)
- ✓ Settings → FaithConnect → Notifications → Allow

### Notifications not arriving
- ✓ Check APNs certificate is valid
- ✓ Verify token is registered in backend
- ✓ Check backend is sending to correct token
- ✓ Use a physical device (not simulator)

### Testing on Physical Device
```bash
# Build and install on device
eas build --platform ios --auto-submit

# Or use development build
eas build --platform ios --dev-client

# Or run directly
expo run:ios --device
```

## Development vs Production

### Development Builds
- Use during development
- Faster to rebuild
- Use Sandbox APNs certificates

### Production Builds
- Use for TestFlight and App Store
- Requires production APNs certificate
- Requires code signing

## iOS Specific Code

The notification service now handles both platforms:

```typescript
if (Platform.OS === 'ios') {
  // iOS-specific initialization
  const { status } = await Notifications.requestPermissionsAsync();
  console.log('iOS notification permission status:', status);
} else if (Platform.OS === 'android') {
  // Android-specific initialization (FCM)
  // ... Firebase setup
}
```

## Files Updated for iOS

1. **app.json**
   - Added `UIBackgroundModes` with "remote-notification"
   - Reordered iOS config for clarity

2. **notificationService.ts**
   - Added iOS-specific permission request
   - Platform-specific channel setup

3. **firebaseSetup.ts**
   - Updated verification for both platforms
   - iOS-specific configuration logging

## Next Steps for iOS

1. **Get Apple Developer Account** (if you don't have one)
2. **Create APNs Certificate** in Apple Developer Portal
3. **Upload Certificate to Expo** via Dashboard or EAS CLI
4. **Rebuild the App** with new certificate
5. **Test on Physical Device**

## Resources

- [Apple Developer Account](https://developer.apple.com/account/)
- [Expo iOS Push Notifications](https://docs.expo.dev/push-notifications/setup/)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server)
- [EAS Build Documentation](https://docs.expo.dev/eas-update/getting-started/)

## Comparison: Android vs iOS Setup

### Android Setup
1. ✅ Create Firebase project
2. ✅ Register Android app
3. ✅ Download google-services.json
4. ✅ Place in mobile/
5. ✅ Done!

### iOS Setup
1. ⏳ Create Apple Developer Account ($99/year)
2. ⏳ Create App ID in Developer Portal
3. ⏳ Generate APNs certificate
4. ⏳ Upload to Expo
5. ⏳ Rebuild app
6. ⏳ More complex process

**Note**: iOS setup is more involved but is the standard for Apple apps.

## Important Notes

⚠️ **APNs Certificate Expiration**
- Certificates expire after 1 year
- Set renewal reminders
- App will stop receiving notifications if expired

⚠️ **Bundle Identifier**
- Must match: `com.faithconnect.sujan0629`
- Must match App ID in Apple Developer Portal
- Changing it requires new App ID and certificate

⚠️ **Sandbox vs Production**
- Use Sandbox certificates for development
- Use Production certificates for App Store
- Mixing them causes notification failures

✅ **Both Platforms Supported**
- Android: FCM via google-services.json
- iOS: APNs via Apple Developer Account
- Expo handles both automatically!
