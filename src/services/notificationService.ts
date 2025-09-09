import messaging from '@react-native-firebase/messaging';
import { Platform, Alert, Linking } from 'react-native';
import { PermissionsAndroid } from 'react-native';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  type?: string;
  bookingId?: string;
  driverId?: string;
  userId?: string;
}

class NotificationService {
  private fcmToken: string | null = null;

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Request Android permissions
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        ]);

        const postNotificationGranted = granted[PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS] === 'granted';
        
        if (!postNotificationGranted) {
          console.log('Notification permission denied');
          return false;
        }
      }

      // Request Firebase messaging permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      if (!this.fcmToken) {
        this.fcmToken = await messaging().getToken();
        console.log('FCM Token:', this.fcmToken);
      }
      return this.fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Refresh FCM token
   */
  async refreshToken(): Promise<string | null> {
    try {
      this.fcmToken = await messaging().getToken();
      console.log('FCM Token refreshed:', this.fcmToken);
      return this.fcmToken;
    } catch (error) {
      console.error('Error refreshing FCM token:', error);
      return null;
    }
  }

  /**
   * Subscribe to a topic
   */
  async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Handle notification tap when app is in background/quit
   */
  handleInitialNotification(): Promise<any> {
    return messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });
  }

  /**
   * Handle notification tap
   */
  handleNotificationTap(remoteMessage: any): void {
    console.log('Notification tapped:', remoteMessage);
    
    const { data } = remoteMessage;
    
    if (data) {
      // Handle different notification types
      switch (data.type) {
        case 'booking_request':
          // Navigate to booking details
          console.log('Navigate to booking request:', data.bookingId);
          break;
        case 'booking_accepted':
          // Navigate to booking accepted screen
          console.log('Navigate to booking accepted:', data.bookingId);
          break;
        case 'booking_cancelled':
          // Navigate to booking cancelled screen
          console.log('Navigate to booking cancelled:', data.bookingId);
          break;
        case 'driver_arrived':
          // Navigate to driver arrived screen
          console.log('Navigate to driver arrived:', data.bookingId);
          break;
        case 'trip_completed':
          // Navigate to trip completed screen
          console.log('Navigate to trip completed:', data.bookingId);
          break;
        default:
          console.log('Unknown notification type:', data.type);
      }
    }
  }

  /**
   * Show local notification (for testing)
   */
  showLocalNotification(title: string, body: string, data?: any): void {
    Alert.alert(
      title,
      body,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'View',
          onPress: () => {
            if (data) {
              this.handleNotificationTap({ data });
            }
          },
        },
      ]
    );
  }

  /**
   * Check if app is in foreground
   */
  isAppInForeground(): boolean {
    return messaging().isDeviceRegisteredForRemoteMessages;
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners(): void {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      // You can perform background tasks here
      return Promise.resolve();
    });

    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      
      // Show local notification when app is in foreground
      if (remoteMessage.notification) {
        this.showLocalNotification(
          remoteMessage.notification.title || 'New Notification',
          remoteMessage.notification.body || 'You have a new message',
          remoteMessage.data
        );
      }
    });

    // Handle notification tap when app is in background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    return unsubscribe;
  }

  /**
   * Send notification to server (for testing)
   */
  async sendTestNotification(token: string, title: string, body: string, data?: any): Promise<boolean> {
    try {
      // This would typically be done from your backend server
      // For testing, you can use Firebase Console or a service like Postman
      console.log('Send notification to token:', token);
      console.log('Title:', title);
      console.log('Body:', body);
      console.log('Data:', data);
      
      // Example payload for server:
      const payload = {
        to: token,
        notification: {
          title,
          body,
        },
        data: data || {},
      };
      
      console.log('Payload for server:', JSON.stringify(payload, null, 2));
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }
}

export default new NotificationService();

