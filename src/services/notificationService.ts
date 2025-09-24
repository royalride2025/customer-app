import messaging from '@react-native-firebase/messaging';
import { Platform, Alert, Linking, Vibration, AppState } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import networkClient from '../../networkClient';
import { API_ENDPOINTS } from '../../apiEndpoints';

import store from '../redux/store';
import { updateBookingStatus, updateCurrentBooking, clearCurrentBooking, clearBookingStatus, setCurrentBooking } from '../redux/bookingSlice';
import { navigate } from '../navigation/navigationRef';
import { navigationRef } from '../navigation/navigationRef';

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
          // Ensure navigation to map when app opened from killed state via notification
          this.navigateToMapWhenReady();
        }
      });
  }

  /**
   * Handle notification tap
   */
  handleNotificationTap(remoteMessage: any): void {
    console.log('Notification tapped:', remoteMessage);
    
    const { data } = remoteMessage;
    console.log('data-----', data);

    // Normalize payload (parse when notificationData is a JSON string)
    const normalized = this.parseNotificationPayload(data);

    if (normalized) {
      // Handle different notification types (keep minimal logic; special-case cancel only)
      const type = (normalized.type || '').toString();
      switch (type) {
        case 'NEW_SCHEDULED_BOOKING':
          console.log('New scheduled booking:', normalized.bookingId);
          navigate('map');
          break;
        case 'NEW_INSTANT_BOOKING':
          console.log('New instant booking:', normalized.bookingId);
          navigate('map');
          break;
        case 'BOOKING_STATUS_UPDATED': {
          const status = normalized.metaData?.status || '';
          const message = normalized.message || `Booking status updated: ${status}`;
          store.dispatch(updateBookingStatus({ status, message }));
         
          console.log('Dispatched booking status update from tap:', status);
          this.navigateToMapWhenReady();
          break;
        }
        case 'BOOKING_CANCELLED':
          console.log('Booking cancelled:', normalized.bookingId);
          this.processBookingCancelled(normalized);
          break;
        case 'DRIVER_ASSIGNED':
          console.log('Driver assigned:', normalized.driverId);
          navigate('map');
          break;
        case 'NEW_RIDER_REGISTERED':
          console.log('New rider registered:', normalized.userId);
          // Navigate to appropriate screen or show notification
          break;
        case 'PAYMENT_WITHDRAW_REQUEST':
          console.log('Payment withdraw request:', normalized.bookingId);
          // Navigate to payment or wallet screen
          break;
        case 'NEW_SUPPORT_QUERY':
          console.log('New support query:', normalized.bookingId);
          // Navigate to support screen
          break;
        default:
          console.log('Unknown notification type:', normalized.type);
      }
    }
  }

  /**
   * Format notification data for display
   */
  private formatNotificationData(data: any): string {
    if (!data || Object.keys(data).length === 0) {
      return 'No additional data';
    }

    const formattedData = Object.entries(data)
      .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join('\n');

    return formattedData;
  }

  /**
   * Show local notification with detailed data display
   */
  showLocalNotification(title: string, body: string, data?: any): void {
    console.log('🔔 Showing notification alert:', { title, body, data });
    
    // Vibrate device
    if (Platform.OS === 'android') {
      Vibration.vibrate(300);
    }
    
    // Format the data for display
    const dataString = this.formatNotificationData(data);
    const fullMessage = `${body}\n\n📋 Notification Data:\n${dataString}`;
    
    // Show alert dialog with notification data
    // Alert.alert(
    //   `🔔 ${title}`,
    //   fullMessage,
    //   [
    //     {
    //       text: 'Dismiss',
    //       style: 'cancel',
    //       onPress: () => console.log('📱 Notification dismissed')
    //     },
    //     {
    //       text: 'View Details',
    //       onPress: () => {
    //         console.log('📱 Notification data viewed');
    //         this.showDetailedDataAlert(data);
    //       },
    //     },
    //     {
    //       text: 'Handle',
    //       onPress: () => {
    //         console.log('📱 Notification handled');
    //         if (data) {
    //           this.handleNotificationTap({ data });
    //         }
    //       },
    //     },
    //   ],
    //   { 
    //     cancelable: true,
    //     onDismiss: () => console.log('📱 Notification dismissed by user')
    //   }
    // );
  }

  /**
   * Show detailed notification data in a separate alert
   */
  showDetailedDataAlert(data: any): void {
    const dataString = data ? JSON.stringify(data, null, 2) : 'No data available';
    
    Alert.alert(
      '📋 Notification Data Details',
      dataString,
      [
        {
          text: 'Copy to Clipboard',
          onPress: () => {
            // You can use @react-native-clipboard/clipboard to copy data
            console.log('📋 Data copied to clipboard:', dataString);
          },
        },
        {
          text: 'Close',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }

  /**
   * Show incoming notification with full message data (for debugging)
   */
  showIncomingNotificationAlert(remoteMessage: any): void {
    const messageData = {
      notification: remoteMessage.notification || null,
      data: remoteMessage.data || null,
      messageId: remoteMessage.messageId || null,
      from: remoteMessage.from || null,
      to: remoteMessage.to || null,
      collapseKey: remoteMessage.collapseKey || null,
      sentTime: remoteMessage.sentTime || null,
      ttl: remoteMessage.ttl || null,
    };

    const messageString = JSON.stringify(messageData, null, 2);
    
    Alert.alert(
      '📨 Incoming FCM Message',
      `Full Message Data:\n\n${messageString}`,
      [
        {
          text: 'Log to Console',
          onPress: () => {
            console.log('📨 Full FCM Message:', messageData);
          },
        },
        {
          text: 'Close',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }

  /**
   * Check if app is in foreground
   */
  isAppInForeground(): boolean {
    return AppState.currentState === 'active';
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners(): void {
    console.log('Setting up notification listeners...');

    // Handle background messages (no UI, just state updates)
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      try {
        console.log('Message handled in the background!', remoteMessage);
        const normalized = this.parseNotificationPayload(remoteMessage.data);
        const notificationType = (normalized?.type || '').toString().toUpperCase();

        if (
          notificationType === 'BOOKING_STATUS_UPDATED'
        ) {
          const status = normalized?.metaData?.status || '';
          const message = normalized?.message || `Booking status updated: ${status}`;
          store.dispatch(updateBookingStatus({ status, message }));
         
        } else if (
          notificationType === 'BOOKING_CANCELLED' ||
          notificationType === 'BOOKING_CANCELED'
        ) {
          store.dispatch(clearCurrentBooking());
          store.dispatch(clearBookingStatus());
        }
      } catch (e) {
        console.log('Error handling background message:', e);
      }
      return Promise.resolve();
    });

     // Handle foreground messages
     const unsubscribe = messaging().onMessage(async remoteMessage => {
       console.log('🔔 Notification received in foreground:', remoteMessage);
       
       // Check if app is actually in foreground
       if (!this.isAppInForeground()) {
         console.log('App not in foreground, skipping alert');
         return;
       }

       try {
         // Normalize payload
         const normalized = this.parseNotificationPayload(remoteMessage.data);
         const notificationType = (normalized?.type || 'unknown').toString();
         console.log('Notification type:', notificationType);
         console.log('normalized', normalized);
         // Handle key types
         if (notificationType === 'BOOKING_STATUS_UPDATED') {
          const status = normalized?.metaData?.status || '';
          const message = normalized?.message || `Booking status updated: ${status}`;
          store.dispatch(updateBookingStatus({ status, message }));
         
           // Optionally show a concise UI alert
          //  Alert.alert('Booking Update', message);
           return;
         }
         if (notificationType === 'BOOKING_CANCELLED') {
           this.processBookingCancelled(normalized);
           return;
         }
         if (notificationType === 'NEW_SCHEDULED_BOOKING' || notificationType === 'NEW_INSTANT_BOOKING') {
          //  Alert.alert('New Booking', 'You have a new booking request');
          //  navigate('map');
           return;
         }
         if (notificationType === 'DRIVER_ASSIGNED') {
          //  Alert.alert('Driver Assigned', 'A driver has been assigned to your booking');
          //  navigate('map');
           return;
         }
         if (notificationType === 'PAYMENT_WITHDRAW_REQUEST') {
          //  Alert.alert('Payment Request', 'You have a payment withdraw request');
           return;
         }
         if (notificationType === 'NEW_SUPPORT_QUERY') {
          //  Alert.alert('Support Query', 'You have a new support query');
           return;
         }

         // Fallback debug alert for other types
        //  Alert.alert(
        //    normalized?.title || 'Notification',
        //    normalized?.message || 'You have a new message'
        //  );

        // OPTION 2: Your custom notification processing (comment out if testing with Option 1)
        /*
        let title = 'New Notification';
        let body = 'You have a new message';
        let data = remoteMessage.data || {};
        
        if (remoteMessage.notification) {
          // FCM notification message
          title = remoteMessage.notification.title || title;
          body = remoteMessage.notification.body || body;
          console.log('📱 FCM notification message:', { title, body });
        } else if (remoteMessage.data) {
          // FCM data-only message
          title = (remoteMessage.data.title as string) || (remoteMessage.data.notification_title as string) || title;
          body = (remoteMessage.data.body as string) || (remoteMessage.data.notification_body as string) || (remoteMessage.data.message as string) || body;
          data = remoteMessage.data;
          console.log('📱 FCM data-only message:', { title, body });
        }
        
        // Show notification with data included
        setTimeout(() => {
          this.showLocalNotification(title, body, data);
        }, 100); // Small delay to prevent conflicts
        */

      } catch (error) {
        console.error('Error showing notification alert:', error);
      }
    });

    // Handle notification tap when app is in background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // Handle token refresh
    messaging().onTokenRefresh(fcmToken => {
      console.log('FCM Token refreshed:', fcmToken);
      this.fcmToken = fcmToken;
      // You may want to send the new token to your server
    });

    console.log('✅ Notification listeners setup complete');
    return;
  }

  /**
   * Ensure navigation only happens when NavigationContainer is ready
   */
  private navigateToMapWhenReady(retries: number = 15, delayMs: number = 900) {
    try {
      if (navigationRef.isReady()) {
        navigate('map');
        return;
      }
      if (retries > 0) {
        setTimeout(() => this.navigateToMapWhenReady(retries - 1, delayMs), delayMs);
      } else {
        console.log('Navigation not ready after retries; skipping navigate');
      }
    } catch (e) {
      console.log('navigateToMapWhenReady error:', e);
    }
  }

  /**
   * Centralized booking status update handling
   */
  private processBookingStatusUpdate(payload: any) {
    const status: string = payload?.metaData?.status || payload?.status || '';
    const message: string = payload?.message || `Booking status updated: ${status}`;
    try {
      store.dispatch(updateBookingStatus({ status, message }));
      if (payload?.metaData) {
        store.dispatch(updateCurrentBooking({ booking: payload.metaData }));
      }
    } catch (e) {
      console.log('Error dispatching booking status update:', e);
    }

    // Quick UX signal
    // if (message) {
    //   try { Alert.alert('Booking Update', message); } catch {}
    // }

    // Ensure user lands on the map to see live status
    try { navigate('map'); } catch (e) { console.log('Navigation to map failed:', e); }
  }

  /**
   * Handle booking cancellation notifications
   */
  private processBookingCancelled(payload: any) {
    const reason: string = payload?.message || 'Your booking was cancelled.';
    try {
      // Clear current booking from state
      store.dispatch(clearCurrentBooking());
      store.dispatch(clearBookingStatus());
    } catch (e) {
      console.log('Error handling booking cancellation:', e);
    }

    // try { Alert.alert('Booking Cancelled', reason); }
    //  catch {}
    try { navigate('map'); } catch (e) { console.log('Navigation to map failed:', e); }
  }

  /**
   * Safely parse and normalize notification payload
   */
  private parseNotificationPayload(data: any): any | null {
    if (!data) return null;

    // If server wrapped everything inside data.notificationData as JSON string
    const wrapped = data.notificationData;
    if (typeof wrapped === 'string') {
      try {
        const parsed = JSON.parse(wrapped);
        return parsed;
      } catch (e) {
        console.log('Failed to parse notificationData JSON string:', e);
      }
    }

    // Otherwise, attempt to coerce to an object with common fields
    const coerced = { ...data };
    return coerced;
  }

  /**
   * Test if notifications are working
   */
  testNotificationSystem(): void {
    console.log('🧪 Testing notification system...');
    
    // Test with sample data
    const sampleData = {
      type: 'test',
      message: 'This is a test notification',
      timestamp: new Date().toISOString()
    };

    this.showLocalNotification(
      'Test Notification', 
      'Testing notification system', 
      sampleData
    );
  }

  /**
   * Register device with FCM token to server
   */
  async registerDevice(fcmToken: string): Promise<boolean> {
    try {
      console.log('Registering device with FCM token...');
      
      const response = await networkClient.post(API_ENDPOINTS.REGISTER_DEVICE, {
        fcmToken: fcmToken
      });
      
      if (response.status === 200 || response.status === 201) {
        console.log('Device registered successfully:', response.data);
        return true;
      } else {
        console.error('Failed to register device:', response.status);
        return false;
      }
    } catch (error: any) {
      console.error('Error registering device:', error.message || error);
      return false;
    }
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