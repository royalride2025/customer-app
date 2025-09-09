export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    type: NotificationType;
    bookingId?: string;
    driverId?: string;
    userId?: string;
    [key: string]: any;
  };
}

export enum NotificationType {
  BOOKING_REQUEST = 'booking_request',
  BOOKING_ACCEPTED = 'booking_accepted',
  BOOKING_CANCELLED = 'booking_cancelled',
  DRIVER_ARRIVED = 'driver_arrived',
  TRIP_STARTED = 'trip_started',
  TRIP_COMPLETED = 'trip_completed',
  PAYMENT_RECEIVED = 'payment_received',
  RATING_REQUEST = 'rating_request',
  GENERAL = 'general',
}

export interface NotificationSettings {
  bookingNotifications: boolean;
  tripNotifications: boolean;
  paymentNotifications: boolean;
  generalNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  timestamp: number;
  read: boolean;
  actionTaken?: string;
}

