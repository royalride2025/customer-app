import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationHistory, NotificationSettings, NotificationType } from '../types/notification';

interface NotificationState {
  fcmToken: string | null;
  permissionGranted: boolean;
  settings: NotificationSettings;
  history: NotificationHistory[];
  unreadCount: number;
  isInitialized: boolean;
}

const initialState: NotificationState = {
  fcmToken: null,
  permissionGranted: false,
  settings: {
    bookingNotifications: true,
    tripNotifications: true,
    paymentNotifications: true,
    generalNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  history: [],
  unreadCount: 0,
  isInitialized: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setFCMToken: (state, action: PayloadAction<string | null>) => {
      state.fcmToken = action.payload;
    },
    setPermissionGranted: (state, action: PayloadAction<boolean>) => {
      state.permissionGranted = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    addNotification: (state, action: PayloadAction<NotificationHistory>) => {
      state.history.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.history.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.history.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    clearHistory: (state) => {
      state.history = [];
      state.unreadCount = 0;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.history.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.history[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.history.splice(index, 1);
      }
    },
  },
});

export const {
  setFCMToken,
  setPermissionGranted,
  updateSettings,
  addNotification,
  markAsRead,
  markAllAsRead,
  clearHistory,
  setInitialized,
  removeNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;

