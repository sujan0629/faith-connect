# iOS Push Notifications Setup

## Overview
iOS push notifications use Apple Push Notification service (APNs), differing from Android's Firebase Cloud Messaging (FCM).[1]

## Key Differences: Android vs iOS

| Aspect | Android | iOS |
|--------|---------|-----|
| Service | Firebase Cloud Messaging (FCM) | Apple Push Notification service (APNs) |
| Configuration | google-services.json | APNs Key (.p8) via EAS credentials |
| Setup Complexity | Simpler | More involved (Apple account required) |
| Token Type | FCM token | APNs device token |
| Backend Usage | Expo SDK to FCM | Expo SDK to APNs |

## iOS Setup Steps

### Step 1: Apple Developer Account
Apple Developer Program required ($99/year).[2]
- [https://developer.apple.com/](https://developer.apple.com/)

### Step 2: Configure APNs Credentials (Recommended: EAS)
**Primary Method: EAS CLI (Handles .p8 Key)**

1. Install EAS CLI: `npm install -g eas-cli`
2. Run: `eas credentials`
   - Select iOS → Push Notifications → Manage
   - Choose: Create new in Apple account or select existing
   - EAS generates/uploads APNs Auth Key (.p8 + Team ID/Key ID).[3][4]

**Alternative: Expo Dashboard**
1. [https://expo.dev/](https://expo.dev/) → Project → Credentials → iOS → Push Notifications
2. Upload .p8 key, Team ID, Key ID.

**Legacy Certificate (Not Recommended)**
- Apple Developer → Keys → Create (+) → Apple Push Notifications service (APNs)
- Download .p8 directly (no CSR).[5]

### Step 3: Configure in EAS Build
Update `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
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

### Step 4: Update app.json
```json
"expo": {
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./local/assets/notification_icon.png",
        "color": "#ffffff",
        "sounds": ["./local/assets/notification_sound.wav"]
      }
    ]
  ]
},
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.faithconnect.sujan0629",
  "infoPlist": {
    "NSCameraUsageDescription": "...",
    "NSPhotoLibraryUsageDescription": "...",
    "NSMicrophoneUsageDescription": "...",
    "ITSAppUsesNonExemptEncryption": false
  }
}
```
Plugin auto-adds `UIBackgroundModes: ["remote-notification"]`.[6][7]

## iOS Testing
**Physical Device Only** (Simulator unsupported).[8]
```bash
eas build --platform ios --profile development
# Install on device, test with Expo push tool
```

## How iOS Notifications Work
```
1. App requests permissions → User grants
2. Device registers with APNs → ExpoPushToken generated
3. Token to backend
4. Backend → Expo API → APNs → Device
5. iOS displays; app handles on tap
```

## Key Renewal
APNs keys (.p8) do not expire; legacy certs do (1 year).[9][5]
- Regenerate via `eas credentials` if revoked.

## Troubleshooting
- **No credentials**: Run `eas credentials`; ensure uploaded.[10]
- **Permission denied**: Check device Settings → App → Notifications.
- **Not arriving**: Verify token, physical device, backend Expo API call.
- **InvalidProviderToken**: Recreate key in Apple/EAS.[10]

## Development vs Production
- **Development**: Sandbox APNs via dev builds.
- **Production**: Production via release builds—separate credentials.

## iOS Specific Code
```typescript
if (Platform.OS === 'ios') {
  const { status } = await Notifications.requestPermissionsAsync();
  console.log('iOS status:', status);
}
```

## Files Updated
1. **app.json**: Added `expo-notifications` plugin.
2. **notificationService.ts**: iOS permissions.
3. **eas.json**: Profiles configured.

## Next Steps
1. Get Apple Developer Account.
2. `eas credentials` → Set push key.
3. `eas build --platform ios --profile development`.
4. Test on device.

## Resources
- [Expo Push Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)[4]
- [EAS Credentials](https://docs.expo.dev/eas/credentials/ios/)
- [Apple APNs](https://developer.apple.com/documentation/usernotifications)

## Comparison: Android vs iOS
**Android**:
1. ✅ Firebase project + google-services.json
2. ✅ Done.

**iOS**:
1. ⏳ Apple account ($99)
2. ⏳ `eas credentials` for APNs key
3. ⏳ Build/test physical device.

**Note**: Expo unifies both platforms.

## Important Notes
⚠️ **Keys vs Certs**: Prefer .p8 keys (no expiry).[5]
⚠️ **Bundle ID**: Match `com.faithconnect.sujan0629` exactly.
✅ **Expo Handles Routing**: Single backend code for FCM/APNs.

[1](https://docs.customer.io/integrations/sdk/expo/1.x/push-notifications/push/)
[2](https://www.amarjanica.com/how-to-set-up-push-notifications-in-expo/)
[3](https://docs.expo.dev/app-signing/managed-credentials/)
[4](https://github.com/expo/expo/issues/13767)
[5](https://stackoverflow.com/questions/46173291/in-the-context-of-apns-does-p8-and-p12-mean-token-and-certificate-based-authent)
[6](https://stackoverflow.com/questions/45440627/do-remote-push-notifications-require-to-add-uibackgroundmodes-in-info-plist)
[7](https://docs.expo.dev/versions/latest/sdk/notifications/)
[8](https://eagerworks.com/blog/app-with-auth-push-notifications-expo)
[9](https://techcommunity.microsoft.com/t5/intune-customer-success/intune-and-the-apns-certificate-faq-and-common-issues/ba-p/280121)
[10](https://github.com/expo/expo/issues/20402)
[11](https://documentation.onesignal.com/docs/en/ios-p8-token-based-connection-to-apns)
[12](https://supabase.com/docs/guides/functions/examples/push-notifications)
[13](https://www.youtube.com/watch?v=OLDKr13spSY)
[14](https://www.magicbell.com/blog/how-to-generate-an-apns-key)