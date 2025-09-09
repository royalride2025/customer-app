# Firebase Push Notifications Setup Guide

This guide will help you set up Firebase push notifications for your React Native Royal Ride app.

## Prerequisites

1. A Firebase project
2. Android Studio (for Android setup)
3. Xcode (for iOS setup)

## Step 1: Firebase Console Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: "Royal Ride" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Add Android App
1. In Firebase Console, click "Add app" and select Android
2. Enter package name: `com.royal_ride`
3. Enter app nickname: "Royal Ride Android"
4. Download `google-services.json` file
5. Replace the placeholder `google-services.json` in `android/app/` with the downloaded file

### 1.3 Add iOS App
1. In Firebase Console, click "Add app" and select iOS
2. Enter bundle ID: `com.royal_ride`
3. Enter app nickname: "Royal Ride iOS"
4. Download `GoogleService-Info.plist` file
5. Replace the placeholder `GoogleService-Info.plist` in `ios/Royal_ride/` with the downloaded file

## Step 2: Android Configuration

### 2.1 Update google-services.json
Replace the placeholder `google-services.json` in `android/app/` with your actual Firebase configuration file.

### 2.2 Add Firebase SDK
The Firebase SDK is already added to your `android/app/build.gradle` file.

### 2.3 Update AndroidManifest.xml
The necessary permissions and services are already added to your AndroidManifest.xml.

## Step 3: iOS Configuration

### 3.1 Update GoogleService-Info.plist
Replace the placeholder `GoogleService-Info.plist` in `ios/Royal_ride/` with your actual Firebase configuration file.

### 3.2 Add Firebase to Xcode
1. Open `ios/Royal_ride.xcworkspace` in Xcode
2. Right-click on the project name in the navigator
3. Select "Add Files to 'Royal_ride'"
4. Navigate to `ios/Royal_ride/GoogleService-Info.plist`
5. Make sure "Copy items if needed" is checked
6. Select "Royal_ride" target
7. Click "Add"

### 3.3 Enable Push Notifications
1. In Xcode, select your project
2. Go to "Signing & Capabilities"
3. Click "+ Capability"
4. Add "Push Notifications"
5. Add "Background Modes" and enable "Background fetch" and "Remote notifications"

## Step 4: Testing

### 4.1 Run the App
```bash
# For Android
npx react-native run-android

# For iOS
npx react-native run-ios
```

### 4.2 Check Console Logs
Look for these logs in your console:
- "FCM Token: [your-token]"
- "Notification Permission: true"
- "Notifications initialized successfully"

### 4.3 Test Notifications
1. Navigate to the Notification Test screen in your app
2. Use the test functions to send notifications
3. Check if notifications appear on your device

## Step 5: Server Integration

### 5.1 Send Notifications from Server
Use the FCM token from your app to send notifications from your backend server.

Example payload for sending notifications:
```json
{
  "to": "FCM_TOKEN_FROM_APP",
  "notification": {
    "title": "New Booking Request",
    "body": "You have a new ride request"
  },
  "data": {
    "type": "booking_request",
    "bookingId": "12345",
    "driverId": "driver123"
  }
}
```

### 5.2 Notification Types
The app supports these notification types:
- `booking_request`: New booking request
- `booking_accepted`: Booking accepted by driver
- `booking_cancelled`: Booking cancelled
- `driver_arrived`: Driver has arrived
- `trip_started`: Trip has started
- `trip_completed`: Trip completed
- `payment_received`: Payment received
- `rating_request`: Rating request
- `general`: General notifications

## Step 6: Troubleshooting

### Common Issues

1. **No FCM Token**
   - Check if Firebase is properly configured
   - Verify google-services.json/GoogleService-Info.plist are correct
   - Check console logs for errors

2. **Permission Denied**
   - Make sure to request notification permissions
   - Check device notification settings
   - For Android, ensure POST_NOTIFICATIONS permission is granted

3. **Notifications Not Received**
   - Verify FCM token is valid
   - Check server-side notification sending
   - Ensure app is not in battery optimization mode

4. **iOS Build Issues**
   - Make sure GoogleService-Info.plist is added to Xcode project
   - Check if Push Notifications capability is enabled
   - Verify bundle ID matches Firebase configuration

### Debug Commands

```bash
# Check Android logs
npx react-native log-android

# Check iOS logs
npx react-native log-ios

# Clean and rebuild
npx react-native clean
npx react-native run-android
```

## Step 7: Production Considerations

### 7.1 Security
- Never expose FCM server key in client code
- Use Firebase Admin SDK on server
- Implement proper authentication

### 7.2 Performance
- Use topic-based messaging for broadcast notifications
- Implement notification batching for multiple users
- Consider notification scheduling

### 7.3 User Experience
- Allow users to customize notification settings
- Implement notification history
- Handle notification tap actions properly

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase Documentation](https://rnfirebase.io/)
- [FCM REST API Reference](https://firebase.google.com/docs/cloud-messaging/http-server-ref)

