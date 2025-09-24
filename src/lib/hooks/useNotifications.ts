import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/reduxHooks';
import {
  setFCMToken,
  setPermissionGranted,
  addNotification,
  markAsRead,
  markAllAsRead,
  clearHistory,
  setInitialized,
  updateSettings,
} from '../../redux/notificationSlice';
import notificationService from '../../services/notificationService';
import { NotificationHistory, NotificationType } from '../../types/notification';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const {
    fcmToken,
    permissionGranted,
    settings,
    history,
    unreadCount,
    isInitialized,
  } = useAppSelector(state => state.notification);

  // Register device with FCM token
  const registerDevice = useCallback(async (token?: string) => {
    const tokenToUse = token || fcmToken;
    if (!tokenToUse) {
      console.error('No FCM token available for device registration');
      return false;
    }
    
    console.log('Attempting to register device with token:', tokenToUse);
    
    try {
      const success = await notificationService.registerDevice(tokenToUse);
      console.log('registerDevice service call result:', success);
      
      if (success) {
        console.log('Device registered successfully with FCM token');
      } else {
        console.error('Failed to register device with FCM token');
      }
      return success;
    } catch (error) {
      console.error('Error registering device:', error);
      return false;
    }
  }, [fcmToken]);

  // Initialize notifications
  const initializeNotifications = useCallback(async () => {
    try {
      console.log('Initializing notifications...');
      
      // Request permission
      const hasPermission = await notificationService.requestPermission();
      dispatch(setPermissionGranted(hasPermission));
      
      if (hasPermission) {
        // Get FCM token
        const token = await notificationService.getToken();
        dispatch(setFCMToken(token));
        
        // Register device with FCM token
        if (token) {
          await registerDevice(token);
        }
        
        // Setup notification listeners
        notificationService.setupNotificationListeners();
        
        // Handle initial notification (app opened from quit state)
        await notificationService.handleInitialNotification();
        
        console.log('Notifications initialized successfully');
      } else {
        console.log('Notification permission denied');
      }
      
      dispatch(setInitialized(true));
    } catch (error) {
      console.error('Error initializing notifications:', error);
      dispatch(setInitialized(true));
    }
  }, [dispatch, registerDevice]);

  // Refresh FCM token
  const refreshToken = useCallback(async () => {
    try {
      const token = await notificationService.refreshToken();
      dispatch(setFCMToken(token));
      
      // Register device with new token
      if (token) {
        await registerDevice(token);
      }
      
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }, [dispatch, registerDevice]);

  // Subscribe to topic
  const subscribeToTopic = useCallback(async (topic: string) => {
    try {
      const success = await notificationService.subscribeToTopic(topic);
      if (success) {
        console.log(`Successfully subscribed to topic: ${topic}`);
      }
      return success;
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
      return false;
    }
  }, []);

  // Unsubscribe from topic
  const unsubscribeFromTopic = useCallback(async (topic: string) => {
    try {
      const success = await notificationService.unsubscribeFromTopic(topic);
      if (success) {
        console.log(`Successfully unsubscribed from topic: ${topic}`);
      }
      return success;
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
      return false;
    }
  }, []);

  // Add notification to history
  const addNotificationToHistory = useCallback((notification: Omit<NotificationHistory, 'id' | 'timestamp'>) => {
    const newNotification: NotificationHistory = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    dispatch(addNotification(newNotification));
  }, [dispatch]);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId: string) => {
    dispatch(markAsRead(notificationId));
  }, [dispatch]);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  // Clear notification history
  const clearNotificationHistory = useCallback(() => {
    dispatch(clearHistory());
  }, [dispatch]);

  // Update notification settings
  const updateNotificationSettings = useCallback((newSettings: Partial<typeof settings>) => {
    dispatch(updateSettings(newSettings));
  }, [dispatch, settings]);

  // Send test notification
  const sendTestNotification = useCallback(async (title: string, body: string, data?: any) => {
    if (!fcmToken) {
      console.error('No FCM token available');
      return false;
    }
    
    try {
      const success = await notificationService.sendTestNotification(fcmToken, title, body, data);
      return success;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }, [fcmToken]);

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeNotifications();
    }
  }, [isInitialized, initializeNotifications]);

  return {
    // State
    fcmToken,
    permissionGranted,
    settings,
    history,
    unreadCount,
    isInitialized,
    
    // Actions
    initializeNotifications,
    refreshToken,
    subscribeToTopic,
    unsubscribeFromTopic,
    addNotificationToHistory,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotificationHistory,
    updateNotificationSettings,
    registerDevice,
    sendTestNotification,
  };
};











